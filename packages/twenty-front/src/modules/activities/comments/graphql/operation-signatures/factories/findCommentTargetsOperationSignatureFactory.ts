import { generateActivityTargetMorphFieldKeys } from '@/activities/utils/generateActivityTargetMorphFieldKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlOperationSignatureFactory } from '@/object-record/graphql/types/RecordGqlOperationSignatureFactory';

type FindCommentTargetsOperationSignatureFactoryParams = {
  objectMetadataItems: ObjectMetadataItem[];
};

export const findCommentTargetsOperationSignatureFactory: RecordGqlOperationSignatureFactory<
  FindCommentTargetsOperationSignatureFactoryParams
> = ({
  objectMetadataItems,
}: FindCommentTargetsOperationSignatureFactoryParams) => {
  return {
    objectNameSingular: CoreObjectNameSingular.CommentTarget,
    variables: {},
    fields: {
      id: true,
      __typename: true,
      createdAt: true,
      updatedAt: true,
      commentId: true,
      // Spread morph field keys first, then override comment with nested fields
      ...generateActivityTargetMorphFieldKeys(objectMetadataItems),
      comment: {
        id: true,
        __typename: true,
        createdAt: true,
        updatedAt: true,
        body: {
          blocknote: true,
          markdown: true,
        },
        author: {
          id: true,
          name: true,
          avatarUrl: true,
          __typename: true,
        },
        authorId: true,
      },
    },
  };
};
