import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { CONNECTED_ACCOUNT_PERMISSION_LABELS } from '@/settings/app-preferences/constants/ConnectedAccountPermissionLabels';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useLingui } from '@lingui/react/macro';
import { getConnectedAccountPermissionScopes } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

type SettingsNativeAccountAppPermissionsCellProps = {
  nativeAccountApp: NativeAccountApp;
  account: Pick<ConnectedAccount, 'scopes'> | undefined;
};

export const SettingsNativeAccountAppPermissionsCell = ({
  nativeAccountApp,
  account,
}: SettingsNativeAccountAppPermissionsCellProps) => {
  const { t } = useLingui();
  const grantedScopes = account?.scopes ?? [];

  const permissionLabels = nativeAccountApp.permissions
    .filter((permission) =>
      getConnectedAccountPermissionScopes({
        permission,
        provider: nativeAccountApp.provider,
      }).some((scope) => grantedScopes.includes(scope)),
    )
    .map((permission) => t(CONNECTED_ACCOUNT_PERMISSION_LABELS[permission]));

  return (
    <TableCell minWidth="0">
      <OverflowingTextWithTooltip text={permissionLabels.join(', ')} />
    </TableCell>
  );
};
