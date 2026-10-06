export type AppApplyPhase =
  | 'build'
  | 'preview'
  | 'confirmation'
  | 'registration'
  | 'installation'
  | 'upload'
  | 'sync'
  | 'pullBase'
  | 'clientGeneration';

export type AppApplyOutcome = 'not-started' | 'partial' | 'unknown' | 'applied';
