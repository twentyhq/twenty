import { isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

export const CreateCalendarEventToolInputZodSchema = z.object({
  title: z.string().describe('The title of the calendar event'),
  description: z
    .string()
    .describe('The event description or agenda')
    .optional(),
  location: z
    .string()
    .describe('The physical or virtual location of the event')
    .optional(),
  startsAt: z
    .string()
    .describe(
      'Event start time as an ISO 8601 date-time with an offset (e.g. 2026-07-01T15:00:00Z). For all-day events pass a date (e.g. 2026-07-01).',
    ),
  endsAt: z
    .string()
    .describe(
      'Event end time as an ISO 8601 date-time with an offset, after startsAt. For all-day events pass the exclusive end date (the day after the last day).',
    ),
  isFullDay: z
    .boolean()
    .describe('Whether the event lasts the whole day')
    .default(false),
  timeZone: z
    .string()
    .describe(
      'IANA time zone for the event (e.g. America/New_York). Defaults to UTC.',
    )
    .optional(),
  attendees: z
    .string()
    .describe(
      'Comma-separated attendee email addresses. Only applied when sendInvitations is true; otherwise ignored.',
    )
    .optional()
    .default(''),
  sendInvitations: z
    .boolean()
    .describe(
      'When true, attendees are added to the event and emailed an invitation. When false, the event is created with no attendees and nobody is notified.',
    )
    .default(false),
  addConferencing: z
    .boolean()
    .describe(
      'When true, a video conferencing link is generated (Google Meet for Google accounts, Microsoft Teams for Microsoft accounts).',
    )
    .default(false),
  connectedAccountId: z
    .string()
    .refine((val) => isValidUuid(val))
    .describe(
      'The UUID of the connected account to create the event on. Provide only if known; otherwise leave blank to use the default calendar account.',
    )
    .optional(),
});
