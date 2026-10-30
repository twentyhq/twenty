// `started` is never terminal on its own: a started attempt found without a
// live lease means the provider may have accepted the call.
export type SetuAiActionAttemptOutcome =
  | 'started'
  | 'succeeded'
  | 'failed'
  | 'blocked'
  | 'ambiguous';
