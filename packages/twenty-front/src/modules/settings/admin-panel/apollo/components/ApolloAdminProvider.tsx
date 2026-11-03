import { t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';
import { ApolloAdminClientContext } from '@/settings/admin-panel/apollo/contexts/ApolloAdminClientContext';
import { useToast } from 'twenty-ui/components/feedback';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

// Admin views render missing data as empty lists, so a refused or unreachable admin API must be surfaced here.
export const ApolloAdminProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { enqueueToast } = useToast();

  const apolloAdminClient = useApolloFactory({
    uri: `${REACT_APP_SERVER_BASE_URL}/admin-panel`,
    onError: (graphQLErrors) => {
      const forbiddenError = graphQLErrors?.find(
        (graphQLError) => graphQLError.extensions?.code === 'FORBIDDEN',
      );

      if (!isDefined(forbiddenError)) {
        return;
      }

      const userFriendlyMessage =
        forbiddenError.extensions?.userFriendlyMessage;

      enqueueToast({
        status: 'error',
        children: isString(userFriendlyMessage)
          ? userFriendlyMessage
          : t`Server administration was refused. Open the admin console, or check that you are signed in to it.`,
        dedupeKey: 'admin-panel-forbidden',
      });
    },
    onNetworkError: () => {
      enqueueToast({
        status: 'error',
        children: t`The admin panel could not reach the server. Reload the page to sign in again.`,
        dedupeKey: 'admin-panel-network-error',
      });
    },
  });

  return (
    <ApolloAdminClientContext.Provider value={apolloAdminClient}>
      {children}
    </ApolloAdminClientContext.Provider>
  );
};
