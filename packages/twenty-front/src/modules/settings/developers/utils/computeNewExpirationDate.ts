import { differenceInDays, parseISO, addDays } from 'date-fns';

export const computeNewExpirationDate = (
  expiresAt: string | null | undefined,
  createdAt: string,
): string | null => {
  if (!expiresAt) {
    return null;
  }
  const expirationDate = parseISO(expiresAt);
  const creationDate = parseISO(createdAt);
  const days = differenceInDays(expirationDate, creationDate);
  return addDays(new Date(), days).toISOString();
};
