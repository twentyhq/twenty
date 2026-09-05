import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular, CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DuplicateMessageListDocument } from '~/generated-metadata/graphql';

export const useDuplicateMessageList = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.MessageList,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const createOneRecordInCache = useCreateOneRecordInCache({
    objectMetadataItem,
  });

  const [mutate] = useMutation(DuplicateMessageListDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const duplicateMessageList = async (messageListId: string) => {
    try {
      const result = await mutate({
        variables: { id: messageListId },
        update: (cache, { data }) => {
          const record = data?.duplicateMessageList;

          if (!isDefined(record)) return;

          const { memberCount: _memberCount, ...duplicatedListRecord } = record;

          const createdRecord: ObjectRecord = {
            ...duplicatedListRecord,
            __typename: getObjectTypename(CoreObjectNameSingular.MessageList),
          };

          createOneRecordInCache(createdRecord);

          const recordNode = getRecordNodeFromRecord({
            objectMetadataItem,
            objectMetadataItems,
            record: createdRecord,
            computeReferences: false,
          });

          if (isDefined(recordNode)) {
            triggerCreateRecordsOptimisticEffect({
              cache,
              objectMetadataItem,
              recordsToCreate: [recordNode],
              objectMetadataItems,
              objectPermissionsByObjectMetadataId,
              upsertRecordsInStore,
            });
          }
        },
      });

      return result?.data?.duplicateMessageList;
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'objectMetadata',
          operationType: CrudOperationType.CREATE,
        });
      } else {
        enqueueErrorSnackBar({ message: t`Failed to duplicate list` });
      }

      return undefined;
    }
  };

  return {
    duplicateMessageList,
  };
};
