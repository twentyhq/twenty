export type OnboardingStepHistoryEffect =
  | 'recordAsReversible'
  | 'clearAfterIrreversibleStep'
  | 'leaveUnchanged';
