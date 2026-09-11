import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// Handles are deliberately omitted: this text reaches the model and the end user,
// and the caller is not necessarily allowed to see every account in the workspace.
export const summarizeConnectedAccountProviders = (
  connectedAccounts: Pick<ConnectedAccountEntity, 'provider'>[],
): string => {
  if (connectedAccounts.length === 0) {
    return 'none';
  }

  const countByProvider = new Map<string, number>();

  for (const connectedAccount of connectedAccounts) {
    countByProvider.set(
      connectedAccount.provider,
      (countByProvider.get(connectedAccount.provider) ?? 0) + 1,
    );
  }

  return [...countByProvider.entries()]
    .sort(([firstProvider], [secondProvider]) =>
      firstProvider.localeCompare(secondProvider),
    )
    .map(([provider, count]) => `${count} ${provider}`)
    .join(', ');
};
