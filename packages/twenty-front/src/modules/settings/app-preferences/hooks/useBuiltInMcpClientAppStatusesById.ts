import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { type SettingsMemberApplicationStatus } from '@/settings/applications/types/SettingsMemberApplicationStatus';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { CurrentUserApplicationAuthorizationsDocument } from '~/generated-metadata/graphql';

export const useBuiltInMcpClientAppStatusesById = (): Record<
  string,
  SettingsMemberApplicationStatus[]
> => {
  const { data } = useQuery(CurrentUserApplicationAuthorizationsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  if (!isDefined(data)) {
    return {};
  }

  const connectedWellKnownOAuthClients = new Set(
    data.currentUserApplicationAuthorizations.map(
      ({ wellKnownOAuthClient }) => wellKnownOAuthClient,
    ),
  );

  return Object.fromEntries(
    BUILT_IN_MCP_CLIENT_APPS.filter(
      ({ wellKnownOAuthClient }) =>
        !connectedWellKnownOAuthClients.has(wellKnownOAuthClient),
    ).map(({ id }) => [id, [{ type: 'notConnected' }]]),
  );
};
