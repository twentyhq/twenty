import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { type AppPreferencesApp } from '@/settings/app-preferences/types/AppPreferencesApp';
import { getNativeAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getNativeAccountAppsUsingAccount';
import { useLingui } from '@lingui/react/macro';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsAppPreferencesAppStatusCellProps = {
  item: AppPreferencesApp;
};

export const SettingsAppPreferencesAppStatusCell = ({
  item,
}: SettingsAppPreferencesAppStatusCellProps) => {
  const { t } = useLingui();
  const { groups, loading } = useMyAccountGroups();

  if (item.type !== 'native') {
    return null;
  }

  const hasAccount = groups.some((group) =>
    getNativeAccountAppsUsingAccount(group.nativeAccount).some(
      (app) => app.id === item.nativeAccountApp.id,
    ),
  );

  if (loading || hasAccount) {
    return null;
  }

  return <Status color="red">{t`Missing account`}</Status>;
};
