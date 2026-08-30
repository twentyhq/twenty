// WebKit reports readiness before the microphone is actually capturing, so the
// "speak now" affordance is held back rather than promising readiness early.
export const DICTATION_READINESS_DELAY_IN_MS = 300;
