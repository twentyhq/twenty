// Deliberately much shorter than the server's People Data Labs request timeout:
// a slow enrichment must not hold the user on the invite step. Past it the step
// is skipped client-side and the server still routes the lead on the next load.
export const COMPANY_ENRICHMENT_SETTLEMENT_TIMEOUT_MS = 2500;
