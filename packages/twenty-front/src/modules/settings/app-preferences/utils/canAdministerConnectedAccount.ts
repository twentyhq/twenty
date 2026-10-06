import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';

// Mirrors the server's administration rule: owners act on their own accounts,
// and a workspace-shared account owned by someone else needs the provider's
// administration permission.
export const canAdministerConnectedAccount = ({
  account,
  currentUserWorkspaceId,
  hasAdministrationPermission,
}: {
  account: Pick<ConnectedAccount, 'userWorkspaceId' | 'visibility'>;
  currentUserWorkspaceId: string | null | undefined;
  hasAdministrationPermission: boolean;
}): boolean =>
  account.userWorkspaceId === currentUserWorkspaceId ||
  (account.visibility === 'workspace' && hasAdministrationPermission);
