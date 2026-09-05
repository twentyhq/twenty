import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { type ShareRecordModalTarget } from '@/record-share/types/ShareRecordModalTarget';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  RecordSharesDocument,
  ShareRecordDocument,
  type ShareWithInput,
} from '~/generated-metadata/graphql';

export const useShareRecord = ({
  objectMetadataId,
  recordId,
}: ShareRecordModalTarget) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [shareRecordMutation] = useMutation(ShareRecordDocument);

  const shareRecord = async (shareWith: ShareWithInput[]) => {
    try {
      await shareRecordMutation({
        variables: { objectMetadataId, recordId, shareWith },
        update: (cache, { data }) => {
          if (!data) {
            return;
          }

          cache.writeQuery({
            query: RecordSharesDocument,
            variables: { objectMetadataId, recordId },
            data: { recordShares: data.shareRecord },
          });
        },
      });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });
    }
  };

  return { shareRecord };
};
