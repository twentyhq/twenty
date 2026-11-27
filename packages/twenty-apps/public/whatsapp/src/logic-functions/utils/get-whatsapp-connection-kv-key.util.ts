export const getWhatsappConnectionKvKey = ({
  kind,
  connectedAccountId,
}: {
  kind: 'settings' | 'history-import';
  connectedAccountId: string;
}): string => `whatsapp-${kind}:${connectedAccountId}`;
