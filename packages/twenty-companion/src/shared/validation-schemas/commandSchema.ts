import { preferencesSchema } from './preferencesSchema';
import { z } from 'zod';

export const commandSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('connect'), serverUrl: z.string().max(2048) }),
  z.object({ type: z.literal('disconnect') }),
  z.object({ type: z.literal('cancel-connect') }),
  z.object({ type: z.literal('refresh') }),
  z.object({
    type: z.literal('settings'),
    settings: preferencesSchema.partial(),
  }),
  z.object({
    type: z.literal('permission'),
    permission: z.enum(['microphone', 'accessibility', 'system-audio']),
  }),
  z.object({ type: z.literal('complete-setup') }),
  z.object({ type: z.literal('begin-permission-setup') }),
  z.object({ type: z.literal('cancel-permission-setup') }),
  z.object({ type: z.literal('join'), meetingId: z.string().uuid() }),
  z.object({ type: z.literal('skip'), meetingId: z.string().uuid() }),
  z.object({ type: z.literal('unskip'), meetingId: z.string().uuid() }),
  z.object({
    type: z.literal('record'),
    windowId: z.string().max(256).optional(),
  }),
  z.object({ type: z.literal('stop') }),
  z.object({ type: z.literal('pause') }),
  z.object({ type: z.literal('resume') }),
  z.object({
    type: z.literal('open-app'),
    page: z.enum(['agenda', 'settings']).optional(),
  }),
  z.object({
    type: z.literal('open-recording'),
    recordingId: z.string().uuid(),
  }),
  z.object({ type: z.literal('open-recordings') }),
  z.object({ type: z.literal('open-calendar-settings') }),
  z.object({
    type: z.literal('open-desktop-installation'),
    serverUrl: z.string(),
  }),
  z.object({ type: z.literal('open-desktop-setup'), serverUrl: z.string() }),
  z.object({ type: z.literal('dismiss-error') }),
]);
