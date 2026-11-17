import { isNonEmptyString } from '@sniptt/guards';

export const parseAdminBillingArrangementCreditAllowance = (
  value: string,
): number | null => {
  if (!isNonEmptyString(value.trim())) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};
