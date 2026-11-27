export const getMonthlyAmountFromBillingPeriodCents = ({
  cents,
  isYearlyPlan,
}: {
  cents: number;
  isYearlyPlan: boolean;
}) => (isYearlyPlan ? cents / 12 : cents) / 100;
