// A crashed worker's lease must expire so a later delivery can resume the import.
export const CALL_RECORDING_ARTIFACTS_IMPORT_CLAIM_TTL_MS = 10 * 60 * 1000;
