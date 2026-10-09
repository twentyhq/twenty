import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { getNativeAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getNativeAccountAppsUsingAccount';
import { useLingui } from '@lingui/react/macro';
import { Status } from 'twenty-ui/primitives/data-display';

type SettingsNativeAccountAppStatusCellProps = {
  item: NativeAccountApp;
};

export const SettingsNativeAccountAppStatusCell = ({
  item,
}: SettingsNativeAccountAppStatusCellProps) => {
  const { t } = useLingui();
  const { groups, loading } = useMyAccountGroups();

  const hasAccount = groups.some((group) =>
    getNativeAccountAppsUsingAccount(group.nativeAccount).some(
      (app) => app.id === item.id,
    ),
  );

  if (loading || hasAccount) {
    return null;
  }

  return <Status color="red">{t`Missing account`}</Status>;
};
