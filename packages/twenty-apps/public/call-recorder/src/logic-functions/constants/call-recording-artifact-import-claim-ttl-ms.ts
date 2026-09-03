// Crash safety net: a lease older than this is reclaimable so a worker that died
// mid-import never blocks the recording forever. Normal runs release explicitly.
export const CALL_RECORDING_ARTIFACT_IMPORT_CLAIM_TTL_MS = 10 * 60 * 1000;
