export const getLinkedinConnectionKvKey = ({
  kind,
  connectedAccountId,
}: {
  kind: 'settings' | 'person-reviews' | 'history-import';
  connectedAccountId: string;
}): string => `linkedin-${kind}:${connectedAccountId}`;
