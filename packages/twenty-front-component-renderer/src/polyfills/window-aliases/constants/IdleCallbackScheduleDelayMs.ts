// Paced at one frame so a callback that re-requests itself cannot occupy the
// worker thread that also services rendering and host RPC. Anything below 4 ms
// is clamped to 4 ms by the timer nesting rules once a callback re-requests,
// so a smaller value here would not be the delay that actually applies.
export const IDLE_CALLBACK_SCHEDULE_DELAY_MS = 16;
