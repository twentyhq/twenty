import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useLingui } from '@lingui/react/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

type SettingsBuiltInAccountAppPermissionsCellProps = {
  builtInAccountApp: BuiltInAccountApp;
  account: Pick<ConnectedAccount, 'scopes'> | undefined;
};

export const SettingsBuiltInAccountAppPermissionsCell = ({
  builtInAccountApp,
  account,
}: SettingsBuiltInAccountAppPermissionsCellProps) => {
  const { t } = useLingui();
  const grantedScopes = account?.scopes ?? [];

  const permissionLabels = builtInAccountApp.permissions
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
