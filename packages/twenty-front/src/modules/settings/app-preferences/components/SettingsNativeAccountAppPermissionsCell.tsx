import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useLingui } from '@lingui/react/macro';
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
      permission.scopes.some((scope) => grantedScopes.includes(scope)),
    )
    .map((permission) => t(permission.label));

  return (
    <TableCell minWidth="0">
      <OverflowingTextWithTooltip text={permissionLabels.join(', ')} />
    </TableCell>
  );
};
