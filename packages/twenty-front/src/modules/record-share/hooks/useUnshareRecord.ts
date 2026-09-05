import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { type ShareRecordModalTarget } from '@/record-share/types/ShareRecordModalTarget';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  RecordSharesDocument,
  UnshareRecordDocument,
} from '~/generated-metadata/graphql';

export const useUnshareRecord = ({
  objectMetadataId,
  recordId,
}: ShareRecordModalTarget) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [unshareRecordMutation] = useMutation(UnshareRecordDocument);

  const unshareRecord = async (principalId: string) => {
    try {
      await unshareRecordMutation({
        variables: { objectMetadataId, recordId, principalId },
        update: (cache, { data }) => {
          if (!data) {
            return;
          }

          cache.writeQuery({
            query: RecordSharesDocument,
            variables: { objectMetadataId, recordId },
            data: { recordShares: data.unshareRecord },
          });
        },
      });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });
    }
  };

  return { unshareRecord };
};
