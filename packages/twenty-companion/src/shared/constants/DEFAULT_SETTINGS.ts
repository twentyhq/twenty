import { type Settings } from '../types/Settings';

export const DEFAULT_SETTINGS: Settings = {
  // Electron parses accelerators as fixed tokens.
  // oxlint-disable-next-line lingui/no-unlocalized-strings
  openShortcut: 'CommandOrControl+Shift+Space',
  autoJoin: true,
  autoRecord: false,
  launchAtLogin: false,
  appearance: 'system',
  notifyOnDetectedCall: true,
  showMeetingCountdown: true,
  setupCompleted: false,
};
