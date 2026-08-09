// Polling three inbox queries every few seconds for every signed-in user is
// load the workspace pays for whether or not anyone is looking. Reading
// visibility at poll time rather than holding it in state keeps this out of
// the render path: a hidden tab simply skips its turn and resumes on return.
export const shouldSkipInboxPoll = (): boolean =>
  typeof document !== 'undefined' && document.hidden;
