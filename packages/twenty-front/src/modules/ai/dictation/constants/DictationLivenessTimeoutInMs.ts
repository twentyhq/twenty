// Long enough that a slow engine start is not mistaken for a dead one, short
// enough that a user on a surface where the API never emits is not left
// talking to nothing.
export const DICTATION_LIVENESS_TIMEOUT_IN_MS = 2500;
