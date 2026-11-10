import { type ConnectableApp } from '@/settings/app-preferences/types/ConnectableApp';
import { getConnectableAppStatusesById } from '@/settings/app-preferences/utils/getConnectableAppStatusesById';
import { useQuery } from '@apollo/client/react';
import { CurrentUserApplicationAuthorizationsDocument } from '~/generated-metadata/graphql';

export const useConnectableAppStatusesById = (
  connectableApps: Pick<ConnectableApp, 'id'>[],
) => {
  const { data } = useQuery(CurrentUserApplicationAuthorizationsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  return getConnectableAppStatusesById({
    connectableApps,
    authorizations: data?.currentUserApplicationAuthorizations,
  });
};
