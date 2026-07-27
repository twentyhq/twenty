export const RECALL_BOT_DETECTION_USING_PARTICIPANT_NAMES_ACTIVATE_AFTER_SECONDS = 300;
export const RECALL_BOT_DETECTION_USING_PARTICIPANT_NAMES_TIMEOUT_SECONDS = 5;

// Behavioral detection (a participant that never speaks nor shares) can misfire
// on silent humans, so it activates only after a long grace period.
export const RECALL_BOT_DETECTION_USING_PARTICIPANT_EVENTS_ACTIVATE_AFTER_SECONDS = 300;
export const RECALL_BOT_DETECTION_USING_PARTICIPANT_EVENTS_TIMEOUT_SECONDS = 10;
