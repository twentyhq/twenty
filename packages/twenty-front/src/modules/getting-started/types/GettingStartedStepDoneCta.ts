export type GettingStartedStepDoneCta =
  | { type: 'chatThread'; chatThreadId: string }
  | { type: 'workflow' }
  | { type: 'invite' };
