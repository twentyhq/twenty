import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { VOICENOTES_WEBHOOK_LOGIC_FUNCTION_UID } from 'src/constants/universal-identifiers';
import { linkCreatorAsAttendee } from 'src/utils/link-creator-as-attendee';

// Inbound HTTP webhook from Voicenotes. Real handler (Phase D — replaces the
// Phase C stub).
//
// Routing: each Twenty workspaceMember has a `voicenotesWebhookToken` field
// (added in scripts/stratum/migrations/014-voicenotes-webhook-tokens.py).
// They paste a personalised URL into Voicenotes' webhook config:
//   POST /s/webhook/voicenotes/<userToken>
// We resolve the token to a workspaceMember; that workspaceMember owns any
// salesNote we create from this hit. Token is the only auth — Voicenotes
// doesn't sign requests (probed 2026-04-30).
//
// Branching by event:
//   - recording.created / recording.updated: upsert a salesNote keyed on
//     voicenotesId, write title → name, transcript → body. New rows get the
//     creator linked as an attendee (best-effort). Same code path for both
//     events because the upsert handles either case.
//   - creation.summary: find the existing salesNote by voicenotesId and
//     write data.content into the summary field. If the summary arrives
//     before the recording.created (race), we drop it with a skip reason
//     rather than create an orphan.
//   - everything else (creation.todo, creation.main-points,
//     recording.deleted, etc.): log + return 200. We don't auto-delete in
//     Twenty when Voicenotes deletes — explicit user action shouldn't be
//     destroyed by an external system.
//
// Response strategy: ALWAYS return 200 (or in error cases, a 200 body with
// {error: '...'}). Returning 4xx/5xx triggers Voicenotes retry storms; we
// would rather log a problem and move on.
//
// Logging: console.error so APPLICATION_LOG_DRIVER=CONSOLE on the `twenty`
// API service pipes the line to Railway logs (HTTP-triggered logic
// functions execute in-process on the API service, NOT via the worker —
// see lesson #11).

type VoicenotesData = {
  id?: string;
  title?: string;
  transcript?: string;
  content?: string;
  type?: string;
  tags?: unknown[];
  created_at?: string;
};

type VoicenotesEventBody = {
  event?: string;
  timestamp?: string;
  data?: VoicenotesData;
};

type WorkspaceMemberLite = {
  id: string;
  userEmail: string | null;
  name: { firstName: string | null; lastName: string | null } | null;
};

// Build a Twenty RICH_TEXT field value from plain transcript text. Twenty
// stores RICH_TEXT as { blocknote, markdown }; the markdown side renders
// fine for read-only views, and the editor will rebuild blocknote from
// markdown when the user opens it. Same shape used by the AI summary
// skill (see sales-note-summarization.ts:47).
const buildRichTextFromText = (text: string): { blocknote: null; markdown: string } => ({
  blocknote: null,
  markdown: text,
});

const lookupWorkspaceMemberByToken = async (
  client: InstanceType<typeof CoreApiClient>,
  userToken: string,
): Promise<WorkspaceMemberLite | null> => {
  const resp = (await client.query({
    workspaceMembers: {
      __args: {
        filter: { voicenotesWebhookToken: { eq: userToken } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          userEmail: true,
          voicenotesWebhookToken: true,
          name: { firstName: true, lastName: true },
        },
      },
    },
  })) as {
    workspaceMembers?: {
      edges?:
        | {
            node?: {
              id?: string | null;
              userEmail?: string | null;
              name?: {
                firstName?: string | null;
                lastName?: string | null;
              } | null;
            } | null;
          }[]
        | null;
    } | null;
  };

  const node = resp?.workspaceMembers?.edges?.[0]?.node;

  if (node == null || typeof node.id !== 'string' || node.id.length === 0) {
    return null;
  }

  return {
    id: node.id,
    userEmail: node.userEmail ?? null,
    name: node.name
      ? {
          firstName: node.name.firstName ?? null,
          lastName: node.name.lastName ?? null,
        }
      : null,
  };
};

const findSalesNoteIdByVoicenotesId = async (
  client: InstanceType<typeof CoreApiClient>,
  voicenotesId: string,
): Promise<string | null> => {
  const resp = (await client.query({
    salesNotes: {
      __args: {
        filter: { voicenotesId: { eq: voicenotesId } },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  })) as {
    salesNotes?: {
      edges?: { node?: { id?: string | null } | null }[] | null;
    } | null;
  };

  const id = resp?.salesNotes?.edges?.[0]?.node?.id;
  return typeof id === 'string' && id.length > 0 ? id : null;
};

const upsertSalesNoteFromVoicenote = async (
  client: InstanceType<typeof CoreApiClient>,
  workspaceMember: WorkspaceMemberLite,
  data: VoicenotesData,
): Promise<{
  action: 'created' | 'updated';
  salesNoteId: string;
  voicenotesId: string;
  attendeeAdded?: boolean;
  attendeeSkipReason?: string;
}> => {
  const voicenotesId = data.id;

  if (typeof voicenotesId !== 'string' || voicenotesId.length === 0) {
    throw new Error('voicenotes payload missing data.id');
  }

  const title =
    typeof data.title === 'string' && data.title.length > 0
      ? data.title
      : '(untitled voicenote)';

  const transcript = typeof data.transcript === 'string' ? data.transcript : '';
  const body = buildRichTextFromText(transcript);

  const existingId = await findSalesNoteIdByVoicenotesId(client, voicenotesId);

  if (existingId !== null) {
    await client.mutation({
      updateSalesNote: {
        __args: {
          id: existingId,
          data: { name: title, body },
        },
        id: true,
      },
    });

    return { action: 'updated', salesNoteId: existingId, voicenotesId };
  }

  const createResp = (await client.mutation({
    createSalesNote: {
      __args: {
        data: {
          name: title,
          body,
          voicenotesId,
          ownerId: workspaceMember.id,
          status: 'DRAFT',
        },
      },
      id: true,
    },
  })) as { createSalesNote?: { id?: string | null } | null };

  const newId = createResp?.createSalesNote?.id;

  if (typeof newId !== 'string' || newId.length === 0) {
    throw new Error('createSalesNote returned no id');
  }

  // Best-effort: link the workspaceMember's matching Person record as an
  // attendee. Same util used by on-sales-note-created. Failures here don't
  // propagate — they're logged inside the helper and returned in the
  // outcome object.
  let attendeeAdded = false;
  let attendeeSkipReason: string | undefined;

  try {
    const outcome = await linkCreatorAsAttendee(
      client,
      {
        id: workspaceMember.id,
        userEmail: workspaceMember.userEmail,
        name: workspaceMember.name,
      },
      newId,
    );
    attendeeAdded = outcome.added;
    attendeeSkipReason = outcome.reason;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    attendeeSkipReason = `error: ${message}`;
  }

  return {
    action: 'created',
    salesNoteId: newId,
    voicenotesId,
    attendeeAdded,
    ...(attendeeSkipReason !== undefined ? { attendeeSkipReason } : {}),
  };
};

const attachSummary = async (
  client: InstanceType<typeof CoreApiClient>,
  data: VoicenotesData,
): Promise<
  | { action: 'summary_attached'; salesNoteId: string; voicenotesId: string }
  | { skipped: true; reason: string }
> => {
  const voicenotesId = data.id;

  if (typeof voicenotesId !== 'string' || voicenotesId.length === 0) {
    return { skipped: true, reason: 'creation.summary missing data.id' };
  }

  const summaryText =
    typeof data.content === 'string' ? data.content : '';

  const existingId = await findSalesNoteIdByVoicenotesId(client, voicenotesId);

  if (existingId === null) {
    // Don't error — summary may legitimately arrive before recording.created
    // in race conditions.
    return {
      skipped: true,
      reason: `no salesNote with voicenotesId=${voicenotesId}`,
    };
  }

  await client.mutation({
    updateSalesNote: {
      __args: {
        id: existingId,
        data: { summary: buildRichTextFromText(summaryText) },
      },
      id: true,
    },
  });

  return {
    action: 'summary_attached',
    salesNoteId: existingId,
    voicenotesId,
  };
};

const handler = async (
  routePayload: RoutePayload<VoicenotesEventBody>,
): Promise<unknown> => {
  const startedAt = Date.now();

  try {
    const userToken = routePayload.pathParameters?.userToken;

    if (typeof userToken !== 'string' || userToken.length < 16) {
      // eslint-disable-next-line no-console
      console.error('[voicenotes-webhook]', {
        event: 'invalid_token',
        durationMs: Date.now() - startedAt,
      });
      return { error: 'invalid_token' };
    }

    const client = new CoreApiClient();

    const workspaceMember = await lookupWorkspaceMemberByToken(client, userToken);

    if (workspaceMember === null) {
      // eslint-disable-next-line no-console
      console.error('[voicenotes-webhook]', {
        event: 'unknown_token',
        userTokenPrefix: userToken.slice(0, 6),
        durationMs: Date.now() - startedAt,
      });
      return { error: 'unknown_token' };
    }

    const body = routePayload.body ?? {};
    const event = typeof body.event === 'string' ? body.event : '';
    const data: VoicenotesData = body.data ?? {};

    let result: unknown;

    switch (event) {
      case 'recording.created':
      case 'recording.updated': {
        result = await upsertSalesNoteFromVoicenote(client, workspaceMember, data);
        break;
      }
      case 'creation.summary': {
        result = await attachSummary(client, data);
        break;
      }
      default: {
        result = {
          skipped: true,
          reason: `unhandled event ${event || '(missing)'}`,
        };
        break;
      }
    }

    // eslint-disable-next-line no-console
    console.error('[voicenotes-webhook]', {
      event,
      voicenotesId: data.id,
      result,
      durationMs: Date.now() - startedAt,
    });

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // eslint-disable-next-line no-console
    console.error('[voicenotes-webhook]', {
      event: 'handler_error',
      error: message,
      durationMs: Date.now() - startedAt,
    });

    // Return 200 with an error body — we'd rather not have Voicenotes retry
    // a bug that's persistent on our side. The line above is in Railway logs.
    return { error: message };
  }
};

export default defineLogicFunction({
  universalIdentifier: VOICENOTES_WEBHOOK_LOGIC_FUNCTION_UID,
  name: 'voicenotes-webhook',
  description:
    'Inbound HTTP webhook for Voicenotes. Resolves the per-user URL token to a workspaceMember, then upserts a salesNote on recording.created / recording.updated and attaches the AI summary on creation.summary. v1 — does not handle delete or creation.todo / creation.main-points (logs + 200).',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/webhook/voicenotes/:userToken',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['user-agent', 'content-type'],
  },
});
