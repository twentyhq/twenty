import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { type SettingsMemberApplicationStatus } from '@/settings/applications/types/SettingsMemberApplicationStatus';
import { isDefined } from 'twenty-shared/utils';
import { type ApplicationAuthorization } from '~/generated-metadata/graphql';

export const getBuiltInMcpClientAppStatusesById = ({
  authorizations,
}: {
  authorizations:
    | Pick<ApplicationAuthorization, 'wellKnownOAuthClient'>[]
    | undefined;
}): Record<string, SettingsMemberApplicationStatus[]> => {
  if (!isDefined(authorizations)) {
    return {};
  }

  const connectedWellKnownOAuthClients = new Set(
    authorizations.map(({ wellKnownOAuthClient }) => wellKnownOAuthClient),
  );

  return Object.fromEntries(
    BUILT_IN_MCP_CLIENT_APPS.filter(
      ({ wellKnownOAuthClient }) =>
        !connectedWellKnownOAuthClients.has(wellKnownOAuthClient),
    ).map(({ id }) => [id, [{ type: 'notConnected' }]]),
  );
};
