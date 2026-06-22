import { defineLogicFunction } from 'twenty-sdk/define';
import type { RoutePayload } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { MULTICA_SYNC_WEBHOOK_FUNCTION_ID } from 'src/constants/universal-identifiers';

interface WebhookPayload {
  event: string;
  issue: {
    id: string;
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    identifier?: string;
    updated_at?: string;
    labels?: string[];
    due_date?: string;
    start_date?: string;
    metadata?: Record<string, unknown>;
  };
}

interface SyncResult {
  received: boolean;
  mapped?: {
    status?: string;
    priority?: string;
    action: string;
  };
}

// Multica status → Twenty Ticket status (our custom object)
const STATUS_MAP: Record<string, string> = {
  backlog: 'OPEN',
  todo: 'OPEN',
  in_progress: 'IN_PROGRESS',
  in_review: 'IN_PROGRESS',
  done: 'RESOLVED',
  cancelled: 'CLOSED',
};

// Multica priority → Twenty Ticket priority (uppercase)
const PRIORITY_MAP: Record<string, string> = {
  urgent: 'URGENT',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

const TICKET_OBJECT_API_NAME = 'xopureTicket';
const TICKET_OBJECT_API_NAME_PLURAL = 'xopureTickets';

const handler = async (
  event: RoutePayload,
): Promise<SyncResult> => {
  const secret = process.env.MULTICA_WEBHOOK_SECRET;
  const signature = event.headers?.['x-multica-signature'];

  if (secret && !signature) {
    console.warn('multica-sync-webhook: missing x-multica-signature header');
    return { received: false };
  }

  const body = event.body as WebhookPayload | null;

  if (!body || !body.issue) {
    return { received: false };
  }

  const issue = body.issue;
  const multicaIssueId = issue.id;

  if (!multicaIssueId) {
    return { received: false };
  }

  // Map Multica fields to Twenty fields
  const mappedStatus = issue.status ? STATUS_MAP[issue.status] : undefined;
  const mappedPriority = issue.priority ? PRIORITY_MAP[issue.priority] : undefined;

  try {
    const client = new CoreApiClient();

    // Step 1: Find the Twenty ticket by multicaIssueId
    const findQuery = `
      query FindTicket($filter: ${TICKET_OBJECT_API_NAME}FilterInput!) {
        ${TICKET_OBJECT_API_NAME_PLURAL}(filter: $filter, first: 1) {
          edges {
            node {
              id
              multicaIssueId
              lastSyncedFromMulticaAt
            }
          }
        }
      }
    `;

    const findResult = await client.query({
      query: findQuery,
      variables: {
        filter: {
          multicaIssueId: { eq: multicaIssueId },
        },
      },
    });

    const tickets =
      (findResult as Record<string, unknown>)?.[TICKET_OBJECT_API_NAME_PLURAL] as
        | { edges?: Array<{ node?: { id: string } }> }
        | undefined;

    const ticket = tickets?.edges?.[0]?.node;

    if (!ticket?.id) {
      console.warn(
        `multica-sync-webhook: no ticket found for Multica issue ${issue.identifier ?? multicaIssueId}`,
      );
      return { received: false };
    }

    // Step 2: Build update fields from mapped Multica data
    const updateFields: Record<string, unknown> = {
      lastSyncedFromMulticaAt: new Date().toISOString(),
    };

    if (issue.title) {
      updateFields.title = issue.title;
    }
    if (issue.description !== undefined) {
      updateFields.description = issue.description;
    }
    if (mappedStatus) {
      updateFields.status = mappedStatus;
    }
    if (mappedPriority) {
      updateFields.priority = mappedPriority;
    }
    if (issue.identifier) {
      updateFields.multicaIdentifier = issue.identifier;
    }
    if (issue.due_date) {
      updateFields.dueDate = issue.due_date;
    }
    if (issue.start_date) {
      updateFields.startDate = issue.start_date;
    }
    if (issue.labels && issue.labels.length > 0) {
      updateFields.labels = JSON.stringify(issue.labels);
    }
    if (issue.metadata) {
      updateFields.metadata = JSON.stringify(issue.metadata);
    }

    // Step 3: Update the ticket with loop guard set
    const updateMutation = `
      mutation UpdateTicket($id: ID!, $data: ${TICKET_OBJECT_API_NAME}UpdateInput!) {
        update${TICKET_OBJECT_API_NAME}(id: $id, data: $data) {
          id
        }
      }
    `;

    await client.mutation({
      query: updateMutation,
      variables: {
        id: ticket.id,
        data: updateFields,
      },
    });

    return {
      received: true,
      mapped: {
        status: mappedStatus,
        priority: mappedPriority,
        action: 'updated',
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`multica-sync-webhook: sync failed: ${message}`);
    return { received: false };
  }
};

export default defineLogicFunction({
  universalIdentifier: MULTICA_SYNC_WEBHOOK_FUNCTION_ID,
  name: 'multica-sync-webhook',
  description:
    'Receive issue change events from Multica and update the corresponding Twenty ticket.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/multica/webhook',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: ['x-multica-signature', 'content-type'],
  },
});
