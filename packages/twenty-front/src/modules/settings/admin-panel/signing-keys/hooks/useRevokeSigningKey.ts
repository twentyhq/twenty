import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { GET_SIGNING_KEYS } from '@/settings/admin-panel/signing-keys/graphql/queries/getSigningKeys';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/feedback';
import { RevokeSigningKeyDocument } from '~/generated-admin/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useRevokeSigningKey = (onSuccess?: () => void) => {
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueToast } = useToast();
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeSigningKeyMutation] = useMutation(RevokeSigningKeyDocument, {
    client: apolloAdminClient,
  });

  const revokeSigningKey = async (id: string) => {
    setIsRevoking(true);

    try {
      await revokeSigningKeyMutation({
        variables: { id },
        refetchQueries: [{ query: GET_SIGNING_KEYS }],
        awaitRefetchQueries: true,
      });

      enqueueToast({ variant: 'success', children: t`Signing key revoked` });
      onSuccess?.();
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children: CombinedGraphQLErrors.is(error)
          ? getErrorMessageFromApolloError(error)
          : t`Failed to revoke signing key. Please try again later.`,
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return { revokeSigningKey, isRevoking };
};
