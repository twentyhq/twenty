import { SENTRY_REPLAY_IGNORE_MUTATIONS_ATTRIBUTE } from '@/error-handler/constants/SentryReplayIgnoreMutationsAttribute';

// Spread on elements producing large DOM mutation batches (e.g. record-table
// rows, kanban cards) to keep Sentry Replay from freezing the main thread
// while serializing them.
export const SENTRY_REPLAY_IGNORE_MUTATIONS_PROPS = {
  [SENTRY_REPLAY_IGNORE_MUTATIONS_ATTRIBUTE]: true,
} as const;
