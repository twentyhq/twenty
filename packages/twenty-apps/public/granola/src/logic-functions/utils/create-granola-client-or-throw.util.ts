import { isNonEmptyString } from '@sniptt/guards';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { z } from 'zod';

import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { GranolaInvalidResponseError } from 'src/logic-functions/types/granola-invalid-response-error';
import {
  GRANOLA_FOLDER_SCHEMA,
  GRANOLA_NOTE_SCHEMA,
  GRANOLA_NOTE_SUMMARY_SCHEMA,
  GRANOLA_TRANSCRIPT_ITEM_SCHEMA,
  GRANOLA_WEBHOOK_ENDPOINT_SCHEMA,
  type GranolaCreateWebhookEndpointParameters,
  type GranolaListNotesParameters,
  type GranolaUpdateWebhookEndpointParameters,
} from 'src/logic-functions/types/granola-api.type';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';

const GRANOLA_API_BASE_URL = 'https://public-api.granola.ai/v1';
const GRANOLA_REQUEST_TIMEOUT_MILLISECONDS = 15_000;
const GRANOLA_PAGINATION_SCHEMA = z.object({
  hasMore: z.boolean(),
  cursor: z.string().nullable(),
});

export const createGranolaClientOrThrow = ({
  apiKey = process.env[GRANOLA_API_KEY_ENV_VAR_NAME],
}: { apiKey?: string } = {}) => {
  const trimmedApiKey = apiKey?.trim();

  if (!isNonEmptyString(trimmedApiKey)) {
    throw new Error('Granola API key is not set.');
  }

  const requestOrThrow = async <TResponse>({
    path,
    schema,
    method = 'GET',
    parameters = {},
    body,
  }: {
    path: string;
    schema: z.ZodType<TResponse>;
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    parameters?: Record<string, string | number | undefined>;
    body?:
      | GranolaCreateWebhookEndpointParameters
      | Omit<GranolaUpdateWebhookEndpointParameters, 'webhookEndpointId'>;
  }): Promise<TResponse> => {
    const url = new URL(`${GRANOLA_API_BASE_URL}${path}`);

    for (const [name, value] of Object.entries(parameters)) {
      if (isDefined(value)) {
        url.searchParams.set(name, String(value));
      }
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${trimmedApiKey}`,
        ...(isDefined(body) ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(isDefined(body) ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(GRANOLA_REQUEST_TIMEOUT_MILLISECONDS),
    }).catch((error: unknown) => {
      throw new RetryableLogicFunctionError(
        error instanceof Error && error.name === 'TimeoutError'
          ? 'Granola did not respond in time. Try again later.'
          : 'Granola is unreachable. Try again later.',
      );
    });

    if (response.status === 429 || response.status >= 500) {
      throw new RetryableLogicFunctionError(
        `Granola is temporarily unavailable (HTTP ${response.status}).`,
      );
    }

    if (!response.ok) {
      throw new GranolaApiError({
        status: response.status,
        body: await response.json().catch(() => undefined),
      });
    }

    const payload: unknown = await response.json().catch(() => {
      throw new RetryableLogicFunctionError(
        'Granola returned an unreadable response.',
      );
    });
    const result = schema.safeParse(payload);

    if (!result.success) {
      throw new GranolaInvalidResponseError();
    }

    return result.data;
  };

  return {
    listNotes: (parameters: GranolaListNotesParameters = {}) =>
      requestOrThrow({
        path: '/notes',
        parameters,
        schema: GRANOLA_PAGINATION_SCHEMA.extend({
          notes: z.array(GRANOLA_NOTE_SUMMARY_SCHEMA),
        }),
      }),
    getNote: ({
      noteId,
      includeTranscript = false,
    }: {
      noteId: string;
      includeTranscript?: boolean;
    }) =>
      requestOrThrow({
        path: `/notes/${encodeURIComponent(noteId)}`,
        parameters: { include: includeTranscript ? 'transcript' : undefined },
        schema: GRANOLA_NOTE_SCHEMA,
      }),
    listTranscriptPage: ({
      noteId,
      ...parameters
    }: {
      noteId: string;
      cursor?: string;
      page_size?: number;
    }) =>
      requestOrThrow({
        path: `/notes/${encodeURIComponent(noteId)}/transcript`,
        parameters,
        schema: GRANOLA_PAGINATION_SCHEMA.extend({
          transcript: z.array(GRANOLA_TRANSCRIPT_ITEM_SCHEMA),
        }),
      }),
    listFolders: (parameters: { cursor?: string; page_size?: number } = {}) =>
      requestOrThrow({
        path: '/folders',
        parameters,
        schema: GRANOLA_PAGINATION_SCHEMA.extend({
          folders: z.array(GRANOLA_FOLDER_SCHEMA),
        }),
      }),
    createWebhookEndpoint: (body: GranolaCreateWebhookEndpointParameters) =>
      requestOrThrow({
        path: '/webhook-endpoints',
        method: 'POST',
        body,
        schema: GRANOLA_WEBHOOK_ENDPOINT_SCHEMA.extend({
          signing_secret: z.string().startsWith('whsec_'),
        }),
      }),
    listWebhookEndpoints: () =>
      requestOrThrow({
        path: '/webhook-endpoints',
        schema: z.object({
          webhook_endpoints: z.array(GRANOLA_WEBHOOK_ENDPOINT_SCHEMA),
        }),
      }),
    updateWebhookEndpoint: ({
      webhookEndpointId,
      ...body
    }: GranolaUpdateWebhookEndpointParameters) =>
      requestOrThrow({
        path: `/webhook-endpoints/${encodeURIComponent(webhookEndpointId)}`,
        method: 'PATCH',
        body,
        schema: GRANOLA_WEBHOOK_ENDPOINT_SCHEMA,
      }),
    deleteWebhookEndpoint: ({
      webhookEndpointId,
    }: {
      webhookEndpointId: string;
    }) =>
      requestOrThrow({
        path: `/webhook-endpoints/${encodeURIComponent(webhookEndpointId)}`,
        method: 'DELETE',
        schema: z.object({
          id: z.string(),
          object: z.literal('webhook_endpoint'),
          deleted: z.literal(true),
        }),
      }),
  };
};
