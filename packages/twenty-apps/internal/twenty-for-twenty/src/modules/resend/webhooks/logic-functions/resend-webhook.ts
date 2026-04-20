import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';

import { RESEND_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/constants/universal-identifiers';
import type { WebhookHandlerResult } from 'src/modules/resend/webhooks/types/webhook-handler-result';
import { findOrCreatePerson } from 'src/modules/resend/shared/utils/find-or-create-person';
import { findRecordByResendId } from 'src/modules/resend/shared/utils/find-record-by-resend-id';
import { getResendClient } from 'src/modules/resend/shared/utils/get-resend-client';
import { mapLastEvent } from 'src/modules/resend/shared/utils/map-last-event';
import { toEmailsField } from 'src/modules/resend/shared/utils/to-emails-field';

type ContactEventData = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  unsubscribed: boolean;
  segment_ids: string[];
  created_at: string;
  updated_at: string;
};

type BaseEmailEventData = {
  email_id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  broadcast_id?: string;
  template_id?: string;
};

type WebhookPayload = {
  type: string;
  created_at: string;
  data: ContactEventData | BaseEmailEventData | Record<string, unknown>;
};

const handleContactCreatedOrUpdated = async (
  client: CoreApiClient,
  data: ContactEventData,
): Promise<WebhookHandlerResult> => {
  const existingId = await findRecordByResendId(
    client,
    'resendContacts',
    data.id,
  );

  const personId = await findOrCreatePerson(client, data.email, {
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
  });

  const contactData: Record<string, unknown> = {
    email: toEmailsField(data.email),
    name: {
      firstName: data.first_name ?? '',
      lastName: data.last_name ?? '',
    },
    unsubscribed: data.unsubscribed,
    lastSyncedFromResend: new Date().toISOString(),
    ...(isDefined(personId) && { personId }),
  };

  if (isDefined(existingId)) {
    await client.mutation({
      updateResendContact: {
        __args: { id: existingId, data: contactData },
        id: true,
      },
    });

    return { action: 'updated', twentyId: existingId, resendId: data.id, personId };
  }

  const createResult = await client.mutation({
    createResendContact: {
      __args: {
        data: {
          ...contactData,
          resendId: data.id,
          createdAt: data.created_at,
        },
      },
      id: true,
    },
  });

  return {
    action: 'created',
    twentyId: createResult.createResendContact?.id,
    resendId: data.id,
    personId,
  };
};

const handleContactDeleted = async (
  client: CoreApiClient,
  data: ContactEventData,
): Promise<WebhookHandlerResult> => {
  const existingId = await findRecordByResendId(
    client,
    'resendContacts',
    data.id,
  );

  if (!isDefined(existingId)) {
    return { skipped: true, reason: 'contact not found in Twenty' };
  }

  await client.mutation({
    deleteResendContact: {
      __args: { id: existingId },
      id: true,
    },
  });

  return { action: 'deleted', twentyId: existingId, resendId: data.id };
};

const handleEmailEvent = async (
  client: CoreApiClient,
  eventType: string,
  data: BaseEmailEventData,
): Promise<WebhookHandlerResult> => {
  const existingId = await findRecordByResendId(
    client,
    'resendEmails',
    data.email_id,
  );

  if (!isDefined(existingId)) {
    return {
      skipped: true,
      reason: `email ${data.email_id} not found in Twenty`,
    };
  }

  const lastEvent = mapLastEvent(eventType);

  if (!isDefined(lastEvent)) {
    return {
      skipped: true,
      reason: `unknown email event type: ${eventType}`,
    };
  }

  await client.mutation({
    updateResendEmail: {
      __args: {
        id: existingId,
        data: {
          lastEvent,
          lastSyncedFromResend: new Date().toISOString(),
        },
      },
      id: true,
    },
  });

  return {
    action: 'updated',
    twentyId: existingId,
    resendId: data.email_id,
    lastEvent,
  };
};

const handler = async (
  params: RoutePayload<WebhookPayload>,
): Promise<WebhookHandlerResult> => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!isNonEmptyString(webhookSecret)) {
    throw new Error('RESEND_WEBHOOK_SECRET environment variable is not set');
  }

  const svixId = params.headers['svix-id'];
  const svixTimestamp = params.headers['svix-timestamp'];
  const svixSignature = params.headers['svix-signature'];

  if (
    !isDefined(svixId) ||
    !isDefined(svixTimestamp) ||
    !isDefined(svixSignature)
  ) {
    return { error: 'Missing webhook signature headers' };
  }

  const resend = getResendClient();

  let event;
  try {
    event = resend.webhooks.verify({
      payload: JSON.stringify(params.body),
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret,
    });
  } catch (error) {
    console.error('[webhook] Resend signature verification failed', error);

    return { error: 'Invalid webhook signature' };
  }

  const client = new CoreApiClient();
  const eventType = event.type;

  switch (eventType) {
    case 'contact.created':
    case 'contact.updated':
      return handleContactCreatedOrUpdated(
        client,
        event.data as ContactEventData,
      );

    case 'contact.deleted':
      return handleContactDeleted(client, event.data as ContactEventData);

    case 'email.sent':
    case 'email.scheduled':
    case 'email.delivered':
    case 'email.delivery_delayed':
    case 'email.complained':
    case 'email.bounced':
    case 'email.opened':
    case 'email.clicked':
    case 'email.received':
    case 'email.failed':
    case 'email.suppressed':
      return handleEmailEvent(
        client,
        eventType,
        event.data as BaseEmailEventData,
      );

    case 'domain.created':
    case 'domain.updated':
    case 'domain.deleted':
      console.log(`[webhook] Domain event ${eventType} received, skipping`);

      return { skipped: true, reason: 'domain events not yet handled' };

    default:
      console.log(`[webhook] Unknown event type: ${eventType}`);

      return { skipped: true, reason: `unknown event type: ${eventType}` };
  }
};

export default defineLogicFunction({
  universalIdentifier: RESEND_WEBHOOK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'resend-webhook',
  description:
    'Receives Resend webhook events for real-time inbound sync of contacts and email delivery status',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/webhook/resend',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [
      'svix-id',
      'svix-timestamp',
      'svix-signature',
    ],
  },
});
