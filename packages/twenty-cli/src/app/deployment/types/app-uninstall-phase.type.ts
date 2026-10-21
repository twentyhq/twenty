export type AppUninstallPhase =
  | 'identity'
  | 'check'
  | 'confirmation'
  | 'uninstall';

export type AppUninstallOutcome = 'not-started' | 'unknown';
