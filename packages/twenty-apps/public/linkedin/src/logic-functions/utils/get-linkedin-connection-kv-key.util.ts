export const getLinkedinConnectionKvKey = ({
  kind,
  connectedAccountId,
}: {
  kind: 'settings' | 'history-import';
  connectedAccountId: string;
}): string => `linkedin-${kind}:${connectedAccountId}`;
