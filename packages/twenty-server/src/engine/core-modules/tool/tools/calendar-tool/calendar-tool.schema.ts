import { isValidUuid } from 'twenty-shared/utils';
import { z } from 'zod';

import { CalendarEventRecurrenceFrequencyEnum } from 'src/modules/calendar/calendar-event-creation-manager/enums/calendar-event-recurrence-frequency.enum';
import { CalendarEventRecurrenceWeekdayEnum } from 'src/modules/calendar/calendar-event-creation-manager/enums/calendar-event-recurrence-weekday.enum';

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
  recurrence: z
    .object({
      frequency: z
        .enum(CalendarEventRecurrenceFrequencyEnum)
        .describe(
          'How often the event repeats. MONTHLY repeats on the day of the month of startsAt, YEARLY on its month and day.',
        ),
      interval: z
        .number()
        .int()
        .min(1)
        .describe('Repeat every N days, weeks, months or years. Defaults to 1.')
        .optional(),
      daysOfWeek: z
        .array(z.enum(CalendarEventRecurrenceWeekdayEnum))
        .describe(
          'WEEKLY only: the days the event repeats on. The day of startsAt is always included.',
        )
        .optional(),
      endDate: z
        .string()
        .describe(
          'Last date the event can repeat on, inclusive, as YYYY-MM-DD in the event time zone. Omit for no end. Do not combine with endOccurrenceCount.',
        )
        .optional(),
      endOccurrenceCount: z
        .number()
        .int()
        .min(1)
        .describe(
          'Total number of occurrences, the first one included. Do not combine with endDate.',
        )
        .optional(),
    })
    .describe('Makes the event repeat. Omit for a single event.')
    .optional(),
});
