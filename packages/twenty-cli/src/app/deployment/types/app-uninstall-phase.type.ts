export type AppUninstallPhase =
  | 'build'
  | 'check'
  | 'confirmation'
  | 'uninstall';

export type AppUninstallOutcome = 'not-started' | 'unknown';
