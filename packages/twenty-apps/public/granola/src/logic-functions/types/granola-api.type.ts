import { z } from 'zod';

const GRANOLA_DATE_TIME_SCHEMA = z.string().datetime({ offset: true });
const GRANOLA_USER_SCHEMA = z.object({
  name: z.string().nullable(),
  email: z.string(),
});

export const GRANOLA_FOLDER_SCHEMA = z.object({
  id: z.string(),
  object: z.literal('folder'),
  name: z.string(),
  parent_folder_id: z.string().nullable(),
});

export const GRANOLA_TRANSCRIPT_ITEM_SCHEMA = z.object({
  speaker: z.object({
    source: z.enum(['microphone', 'speaker']),
    attribution: z.enum(['me', 'them']).optional(),
    diarization_label: z.string().optional(),
    name: z.string().optional(),
  }),
  text: z.string(),
  start_time: GRANOLA_DATE_TIME_SCHEMA,
  end_time: GRANOLA_DATE_TIME_SCHEMA,
});

export const GRANOLA_NOTE_SUMMARY_SCHEMA = z.object({
  id: z.string(),
  object: z.literal('note'),
  title: z.string().nullable(),
  owner: GRANOLA_USER_SCHEMA,
  created_at: GRANOLA_DATE_TIME_SCHEMA,
  updated_at: GRANOLA_DATE_TIME_SCHEMA,
});

export const GRANOLA_NOTE_SCHEMA = GRANOLA_NOTE_SUMMARY_SCHEMA.extend({
  web_url: z.string().url(),
  calendar_event: z
    .object({
      event_title: z.string().nullable(),
      invitees: z.array(z.object({ email: z.string() })),
      organiser: z.string().nullable(),
      calendar_event_id: z.string().nullable(),
      scheduled_start_time: GRANOLA_DATE_TIME_SCHEMA.nullable(),
      scheduled_end_time: GRANOLA_DATE_TIME_SCHEMA.nullable(),
    })
    .nullable(),
  attendees: z.array(GRANOLA_USER_SCHEMA),
  folder_membership: z.array(GRANOLA_FOLDER_SCHEMA),
  summary_text: z.string(),
  summary_markdown: z.string().nullable(),
  transcript: z.array(GRANOLA_TRANSCRIPT_ITEM_SCHEMA).nullable(),
});

export const GRANOLA_WEBHOOK_SCOPE_SCHEMA = z.enum([
  'personal',
  'public',
  'workspace',
]);
export const GRANOLA_WEBHOOK_EVENT_SCHEMA = z.enum([
  'note.access_granted',
  'note.edited',
  'note.generated',
]);

export const GRANOLA_WEBHOOK_ENDPOINT_SCHEMA = z.object({
  id: z.string(),
  object: z.literal('webhook_endpoint'),
  url: z.string().url(),
  url_redacted: z.boolean(),
  events: z.array(GRANOLA_WEBHOOK_EVENT_SCHEMA),
  folder_ids: z.array(z.string()),
  scopes: z.array(GRANOLA_WEBHOOK_SCOPE_SCHEMA),
  created_by: GRANOLA_USER_SCHEMA.nullable(),
  enabled: z.boolean(),
  created_at: GRANOLA_DATE_TIME_SCHEMA,
});

export type GranolaNote = z.infer<typeof GRANOLA_NOTE_SCHEMA>;
export type GranolaNoteSummary = z.infer<typeof GRANOLA_NOTE_SUMMARY_SCHEMA>;
export type GranolaTranscriptItem = z.infer<
  typeof GRANOLA_TRANSCRIPT_ITEM_SCHEMA
>;
export type GranolaFolder = z.infer<typeof GRANOLA_FOLDER_SCHEMA>;
export type GranolaWebhookEndpoint = z.infer<
  typeof GRANOLA_WEBHOOK_ENDPOINT_SCHEMA
>;
export type GranolaWebhookScope = z.infer<typeof GRANOLA_WEBHOOK_SCOPE_SCHEMA>;
export type GranolaWebhookEvent = z.infer<typeof GRANOLA_WEBHOOK_EVENT_SCHEMA>;
export type GranolaListNotesParameters = {
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  folder_id?: string;
  cursor?: string;
  page_size?: number;
};
export type GranolaCreateWebhookEndpointParameters = Pick<
  GranolaWebhookEndpoint,
  'url' | 'scopes'
> &
  Partial<Pick<GranolaWebhookEndpoint, 'events' | 'folder_ids'>>;
export type GranolaUpdateWebhookEndpointParameters = {
  webhookEndpointId: string;
} & Partial<
  Pick<
    GranolaWebhookEndpoint,
    'url' | 'scopes' | 'events' | 'folder_ids' | 'enabled'
  >
>;
