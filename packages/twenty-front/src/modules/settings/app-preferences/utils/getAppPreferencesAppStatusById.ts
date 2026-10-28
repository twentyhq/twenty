import { type AppPreferencesAppStatus } from '@/settings/app-preferences/types/AppPreferencesAppStatus';
import { type AppPreferencesAppStatusAccount } from '@/settings/app-preferences/types/AppPreferencesAppStatusAccount';
import { type AppPreferencesAppStatusApplication } from '@/settings/app-preferences/types/AppPreferencesAppStatusApplication';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { getBuiltInAccountAppStatus } from '@/settings/app-preferences/utils/getBuiltInAccountAppStatus';
import { getInstalledApplicationStatus } from '@/settings/app-preferences/utils/getInstalledApplicationStatus';
import { isDefined } from 'twenty-shared/utils';

export const getAppPreferencesAppStatusById = <
  TConnectedAccount extends AppPreferencesAppStatusAccount,
>({
  groups,
  builtInAccountApps,
  applicationsWithPreferences,
}: {
  groups: ConnectedAccountGroup<TConnectedAccount>[];
  builtInAccountApps: Pick<BuiltInAccountApp, 'id'>[];
  applicationsWithPreferences: AppPreferencesAppStatusApplication[];
}): Record<string, AppPreferencesAppStatus<TConnectedAccount>> => {
  const activeBuiltInAccounts = groups
    .map((group) => group.builtInAccount)
    .filter(isDefined)
    .filter((account) => !isDefined(account.archivedAt));
  const activeAppAccounts = groups
    .flatMap((group) => group.appAccounts)
    .filter((account) => !isDefined(account.archivedAt));

  const statusById: Record<
    string,
    AppPreferencesAppStatus<TConnectedAccount>
  > = {};

  for (const { id } of builtInAccountApps) {
    const status = getBuiltInAccountAppStatus({
      builtInAccountAppId: id,
      activeBuiltInAccounts,
    });

    if (isDefined(status)) {
      statusById[id] = status;
    }
  }

  for (const applicationWithPreferences of applicationsWithPreferences) {
    const status = getInstalledApplicationStatus({
      applicationWithPreferences,
      activeAppAccounts,
    });

    if (isDefined(status)) {
      statusById[applicationWithPreferences.application.id] = status;
    }
  }

  return statusById;
};
