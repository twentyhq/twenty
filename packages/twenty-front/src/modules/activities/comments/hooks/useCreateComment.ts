import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { createOneCommentOperationSignatureFactory } from '@/activities/comments/graphql/operation-signatures/factories/createOneCommentOperationSignatureFactory';
import { type Comment } from '@/activities/comments/types/Comment';
import { type CommentTarget } from '@/activities/comments/types/CommentTarget';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

type CommentToCreate = {
  body: {
    blocknote: string | null;
    markdown: string | null;
  };
  authorId?: string;
};

export const useCreateComment = () => {
  const createOneCommentOperationSignature =
    createOneCommentOperationSignatureFactory({});

  const { createOneRecord: createOneComment } = useCreateOneRecord<Comment>({
    objectNameSingular: CoreObjectNameSingular.Comment,
    recordGqlFields: createOneCommentOperationSignature.fields,
    shouldMatchRootQueryFilter: true,
  });

  const { createManyRecords: createManyCommentTargets } =
    useCreateManyRecords<CommentTarget>({
      objectNameSingular: CoreObjectNameSingular.CommentTarget,
      shouldMatchRootQueryFilter: true,
    });

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectMetadataItem: objectMetadataItemCommentTarget } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CommentTarget,
    });

  const { objectMetadataItem: objectMetadataItemComment } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Comment,
    });

  const cache = useApolloCoreClient().cache;

  const createCommentInDB = useRecoilCallback(
    ({ set }) =>
      async (
        commentToCreate: CommentToCreate,
        targetableObjects: ActivityTargetableObject[],
      ) => {
        const commentId = v4();

        const createdComment = await createOneComment?.({
          id: commentId,
          ...commentToCreate,
          updatedAt: new Date().toISOString(),
        });

        if (!isDefined(createdComment)) {
          return;
        }

        const commentTargetsToCreate = targetableObjects.map(
          (targetableObject) => {
            const targetObjectMetadataItem = objectMetadataItems.find(
              (item) =>
                item.nameSingular === targetableObject.targetObjectNameSingular,
            );

            const targetField = objectMetadataItemCommentTarget?.fields.find(
              (field) =>
                field.relation?.targetObjectMetadata.id ===
                targetObjectMetadataItem?.id,
            );

            const joinColumnName = targetField?.settings?.joinColumnName;

            return {
              id: v4(),
              commentId: createdComment.id,
              ...(isDefined(joinColumnName)
                ? { [joinColumnName]: targetableObject.id }
                : {}),
            };
          },
        );

        if (isNonEmptyArray(commentTargetsToCreate)) {
          await createManyCommentTargets({
            recordsToCreate: commentTargetsToCreate,
          });
        }

        const commentTargetsConnection = getRecordConnectionFromRecords({
          objectMetadataItems,
          objectMetadataItem: objectMetadataItemCommentTarget,
          records: commentTargetsToCreate.map((commentTarget) => ({
            ...commentTarget,
            __typename: capitalize(
              objectMetadataItemCommentTarget.nameSingular,
            ),
          })),
          withPageInfo: false,
          computeReferences: true,
          isRootLevel: false,
        });

        modifyRecordFromCache({
          recordId: createdComment.id,
          cache,
          fieldModifiers: {
            commentTargets: () => commentTargetsConnection,
          },
          objectMetadataItem: objectMetadataItemComment,
        });

        set(recordStoreFamilyState(createdComment.id), {
          ...createdComment,
          commentTargets: commentTargetsToCreate,
        });

        return createdComment;
      },
    [
      cache,
      createManyCommentTargets,
      createOneComment,
      objectMetadataItemComment,
      objectMetadataItemCommentTarget,
      objectMetadataItems,
    ],
  );

  return {
    createComment: createCommentInDB,
  };
};
