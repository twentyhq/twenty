import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { type AppPreferencesRow } from '@/settings/app-preferences/types/AppPreferencesRow';
import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsAppPreferencesAppStatusCellProps = {
  item: AppPreferencesRow;
};

export const SettingsAppPreferencesAppStatusCell = ({
  item,
}: SettingsAppPreferencesAppStatusCellProps) => {
  const { t } = useLingui();
  const { groups, loading } = useMyAccountGroups();

  if (item.type === 'installed') {
    if (
      !isNonEmptyArray(item.applicationWithPreferences.missingRequiredVariables)
    ) {
      return null;
    }

    return <Status color="red">{t`Missing configuration`}</Status>;
  }

  const hasAccount = groups.some((group) =>
    getBuiltInAccountAppsUsingAccount(group.builtInAccount).some(
      (app) => app.id === item.builtInAccountApp.id,
    ),
  );

  if (loading || hasAccount) {
    return null;
  }

  return <Status color="red">{t`Missing account`}</Status>;
};
