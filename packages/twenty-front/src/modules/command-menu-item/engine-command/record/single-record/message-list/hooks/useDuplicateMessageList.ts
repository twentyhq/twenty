import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useAddDuplicatedRecordToCache } from '@/object-record/cache/hooks/useAddDuplicatedRecordToCache';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular, CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DuplicateMessageListDocument } from '~/generated-metadata/graphql';

export const useDuplicateMessageList = () => {
  const { addDuplicatedRecordToCache } = useAddDuplicatedRecordToCache({
    objectNameSingular: CoreObjectNameSingular.MessageList,
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

          addDuplicatedRecordToCache({
            cache,
            record: duplicatedListRecord,
          });
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
