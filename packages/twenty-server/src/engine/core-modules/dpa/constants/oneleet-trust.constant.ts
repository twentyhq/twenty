// Public, unauthenticated OneLeet Trust Center endpoint backing
// https://trust.twenty.com. It returns the live Sub-Processor list (among other
// trust data) and is the same endpoint the public Trust Center page calls.
// scripts/dpa-sync-subprocessors.ts reads it to regenerate subprocessors.json.
export const ONELEET_TRUST_API_URL =
  'https://api.oneleet.com/api/v1/tenants/twenty/trust';
