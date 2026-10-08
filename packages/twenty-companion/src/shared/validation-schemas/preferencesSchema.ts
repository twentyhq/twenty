import { z } from 'zod';

export const preferencesSchema = z.object({
  openShortcut: z.string().min(1).max(100),
  autoJoin: z.boolean(),
  autoRecord: z.boolean(),
  launchAtLogin: z.boolean(),
  appearance: z.enum(['system', 'light', 'dark']),
  notifyOnDetectedCall: z.boolean(),
  showMeetingCountdown: z.boolean(),
});
