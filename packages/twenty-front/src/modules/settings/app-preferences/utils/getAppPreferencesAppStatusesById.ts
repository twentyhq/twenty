import { type AppPreferencesAppStatusAccount } from '@/settings/app-preferences/types/AppPreferencesAppStatusAccount';
import { type AppPreferencesAppStatusApplication } from '@/settings/app-preferences/types/AppPreferencesAppStatusApplication';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { getBuiltInAccountAppStatuses } from '@/settings/app-preferences/utils/getBuiltInAccountAppStatuses';
import { getInstalledApplicationStatuses } from '@/settings/app-preferences/utils/getInstalledApplicationStatuses';
import { type SettingsMemberApplicationStatus } from '@/settings/applications/types/SettingsMemberApplicationStatus';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const getAppPreferencesAppStatusesById = <
  TConnectedAccount extends AppPreferencesAppStatusAccount,
>({
  groups,
  builtInAccountApps,
  applicationsWithPreferences,
}: {
  groups: ConnectedAccountGroup<TConnectedAccount>[];
  builtInAccountApps: Pick<BuiltInAccountApp, 'id'>[];
  applicationsWithPreferences: AppPreferencesAppStatusApplication[];
}): Record<string, SettingsMemberApplicationStatus<TConnectedAccount>[]> => {
  const activeBuiltInAccounts = groups
    .map((group) => group.builtInAccount)
    .filter(isDefined)
    .filter((account) => !isDefined(account.archivedAt));
  const activeAppAccounts = groups
    .flatMap((group) => group.appAccounts)
    .filter((account) => !isDefined(account.archivedAt));

  const statusesById: Record<
    string,
    SettingsMemberApplicationStatus<TConnectedAccount>[]
  > = {};

  for (const { id } of builtInAccountApps) {
    const statuses = getBuiltInAccountAppStatuses({
      builtInAccountAppId: id,
      activeBuiltInAccounts,
    });

    if (isNonEmptyArray(statuses)) {
      statusesById[id] = statuses;
    }
  }

  for (const applicationWithPreferences of applicationsWithPreferences) {
    const statuses = getInstalledApplicationStatuses({
      applicationWithPreferences,
      activeAppAccounts,
    });

    if (isNonEmptyArray(statuses)) {
      statusesById[applicationWithPreferences.application.id] = statuses;
    }
  }

  return statusesById;
};
