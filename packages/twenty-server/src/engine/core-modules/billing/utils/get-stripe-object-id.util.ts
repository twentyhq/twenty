export const getStripeObjectId = (
  reference: string | { id: string },
): string => (typeof reference === 'string' ? reference : reference.id);
