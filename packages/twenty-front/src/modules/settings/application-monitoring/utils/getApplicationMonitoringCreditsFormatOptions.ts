export const getApplicationMonitoringCreditsFormatOptions = (
  creditsUsed: number,
): Intl.NumberFormatOptions => {
  if (creditsUsed > 0 && creditsUsed < 0.01) {
    return { maximumSignificantDigits: 2, roundingMode: 'trunc' };
  }

  if (creditsUsed >= 10) {
    return { maximumFractionDigits: 0, roundingMode: 'trunc' };
  }

  return { maximumFractionDigits: 2, roundingMode: 'trunc' };
};
