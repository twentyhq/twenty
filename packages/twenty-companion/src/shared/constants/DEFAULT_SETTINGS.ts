import { type Settings } from '../types/Settings';
import { doNotTranslate } from '../utils/doNotTranslate';

export const DEFAULT_SETTINGS: Settings = {
  openShortcut: doNotTranslate('CommandOrControl+Shift+Space'),
  autoJoin: true,
  autoRecord: false,
  launchAtLogin: false,
  appearance: 'system',
  notifyOnDetectedCall: true,
  showMeetingCountdown: true,
  setupCompleted: false,
};
