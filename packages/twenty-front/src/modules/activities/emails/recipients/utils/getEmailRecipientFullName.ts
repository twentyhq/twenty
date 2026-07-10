export const getEmailRecipientFullName = (
  name: { firstName: string; lastName: string } | undefined,
): string => `${name?.firstName ?? ''} ${name?.lastName ?? ''}`.trim();
