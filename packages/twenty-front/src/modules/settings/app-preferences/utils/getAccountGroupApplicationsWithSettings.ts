import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const getAccountGroupApplicationsWithSettings = ({
  group,
  applicationsWithPreferences,
}: {
  group: Pick<
    ConnectedAccountGroup<
      Pick<ConnectedAccount, 'applicationId' | 'archivedAt'>
    >,
    'appAccounts'
  >;
  applicationsWithPreferences: ApplicationWithPreferences[];
}): ApplicationWithPreferences[] => {
  const connectedApplicationIds = new Set(
    group.appAccounts
      .filter((appAccount) => !isDefined(appAccount.archivedAt))
      .map((appAccount) => appAccount.applicationId)
      .filter(isDefined),
  );

  return applicationsWithPreferences.filter(
    ({ application, settingsMenuItems }) =>
      connectedApplicationIds.has(application.id) &&
      isNonEmptyArray(settingsMenuItems),
  );
};
