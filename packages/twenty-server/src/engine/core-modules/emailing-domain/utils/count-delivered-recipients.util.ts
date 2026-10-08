export const countDeliveredRecipients = ({
  to,
  cc,
  bcc,
}: {
  to: string[];
  cc?: string[];
  bcc?: string[];
}): number => to.length + (cc?.length ?? 0) + (bcc?.length ?? 0);
