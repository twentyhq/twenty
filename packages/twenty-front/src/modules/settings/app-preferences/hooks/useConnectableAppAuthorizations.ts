import { type ConnectableApp } from '@/settings/app-preferences/types/ConnectableApp';
import { getConnectableAppAuthorizations } from '@/settings/app-preferences/utils/getConnectableAppAuthorizations';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { CurrentUserApplicationAuthorizationsDocument } from '~/generated-metadata/graphql';

export const useConnectableAppAuthorizations = (
  connectableApp: Pick<ConnectableApp, 'id'>,
) => {
  const { data, loading, error, refetch } = useQuery(
    CurrentUserApplicationAuthorizationsDocument,
    { fetchPolicy: 'cache-and-network' },
  );

  return {
    authorizations: getConnectableAppAuthorizations({
      authorizations: data?.currentUserApplicationAuthorizations ?? [],
      connectableAppId: connectableApp.id,
    }),
    loading: loading && !isDefined(data),
    hasLoadError: isDefined(error) && !isDefined(data),
    refetch,
  };
};
