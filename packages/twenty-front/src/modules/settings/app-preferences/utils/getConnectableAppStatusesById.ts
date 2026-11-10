import { type ConnectableApp } from '@/settings/app-preferences/types/ConnectableApp';
import { type SettingsMemberApplicationStatus } from '@/settings/applications/types/SettingsMemberApplicationStatus';
import { isDefined } from 'twenty-shared/utils';
import { type ApplicationAuthorization } from '~/generated-metadata/graphql';

export const getConnectableAppStatusesById = ({
  connectableApps,
  authorizations,
}: {
  connectableApps: Pick<ConnectableApp, 'id'>[];
  authorizations:
    | Pick<ApplicationAuthorization, 'oAuthIdentityUniversalIdentifier'>[]
    | undefined;
}): Record<string, SettingsMemberApplicationStatus[]> => {
  if (!isDefined(authorizations)) {
    return {};
  }

  const connectedAppIds = new Set(
    authorizations.map(
      ({ oAuthIdentityUniversalIdentifier }) =>
        oAuthIdentityUniversalIdentifier,
    ),
  );

  return Object.fromEntries(
    connectableApps
      .filter(({ id }) => !connectedAppIds.has(id))
      .map(({ id }) => [id, [{ type: 'notConnected' }]]),
  );
};
