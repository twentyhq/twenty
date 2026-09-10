import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useAddDuplicatedRecordToCache } from '@/object-record/cache/hooks/useAddDuplicatedRecordToCache';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular, CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { DuplicateMessageListDocument } from '~/generated-metadata/graphql';

export const useDuplicateMessageList = () => {
  const { addDuplicatedRecordToCache } = useAddDuplicatedRecordToCache({
    objectNameSingular: CoreObjectNameSingular.MessageList,
  });

  const [mutate] = useMutation(DuplicateMessageListDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { add: addToast } = useToast();

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
        addToast({ variant: 'error', children: t`Failed to duplicate list` });
      }

      return undefined;
    }
  };

  return {
    duplicateMessageList,
  };
};
