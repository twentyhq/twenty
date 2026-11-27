export const parseAdminBillingArrangementSeats = (
  value: string,
): number | null => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 1 ? parsed : null;
};
