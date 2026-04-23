/* @license Enterprise */

const DAYS_TO_MS = (days: number) => days * 24 * 60 * 60 * 1000;

export const ENTERPRISE_VALIDITY_TOKEN_DEFAULT_EXPIRATION_MS = DAYS_TO_MS(30);
