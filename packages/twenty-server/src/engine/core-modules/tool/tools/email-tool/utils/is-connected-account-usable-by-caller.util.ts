import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// Mirrors ConnectedAccountMetadataService.verifyOwnership, the same rule the sendEmail resolver applies.
export const isConnectedAccountUsableByCaller = ({
  connectedAccount,
  userWorkspaceId,
}: {
  connectedAccount: Pick<
    ConnectedAccountEntity,
    'visibility' | 'userWorkspaceId'
  >;
  userWorkspaceId: string;
}): boolean =>
  connectedAccount.visibility === 'workspace' ||
  connectedAccount.userWorkspaceId === userWorkspaceId;
