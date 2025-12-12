// Matches the server-side conversion in twenty-server
// 1 credit = $0.000001 (1 million credits per dollar)
// Formula: credits = (cents / 100) * 1_000_000 = cents * 10_000
export const convertCentsToBillingCredits = (cents: number): number =>
  Math.round(cents * 10_000);
