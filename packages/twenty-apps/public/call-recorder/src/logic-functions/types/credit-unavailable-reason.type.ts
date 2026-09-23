import { type getCreditAvailability } from 'twenty-sdk/billing';

// twenty-sdk/billing does not export its verdict types.
export type CreditUnavailableReason = Extract<
  Awaited<ReturnType<typeof getCreditAvailability>>,
  { hasAvailableCredits: false }
>['reason'];
