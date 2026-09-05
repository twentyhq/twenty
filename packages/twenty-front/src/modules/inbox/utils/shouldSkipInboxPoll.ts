// Polling three inbox queries for every signed-in user is load the workspace
// pays for whether or not anyone is looking. Visibility is read at poll time
// rather than held in state, so this stays out of the render path.
export const shouldSkipInboxPoll = (): boolean =>
  typeof document !== 'undefined' && document.hidden;
