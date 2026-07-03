import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

const MULTICA_WORKSPACE_ID = 'd11337e4-0c4e-43b8-8fc8-8216c70f1427';
const MULTICA_PROJECT_ID = 'fb2e3c0e-27e0-47ac-b86d-3d2e18832fd6';
const MULTICA_API_URL = 'https://api.multica.ai/api/issues';
const MAX_BATCH = 20;

const STATUS_TO_MULTICA: Record<string, string> = {
  NEW: 'todo',
  PENDING_CUSTOMER: 'in_progress',
  RESOLVED: 'done',
  CLOSED: 'cancelled',
};

const PRIORITY_TO_MULTICA: Record<string, string> = {
  LOW: 'low',
  NORMAL: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

type Output = {
  scanned: number;
  synced: number;
  failed: number;
  skipped: number;
  processedAt: string;
};

const handler = async (): Promise<Output> => {
  const apiKey = process.env['MULTICA_API_KEY'];

  if (!apiKey) {
    return {
      scanned: 0,
      synced: 0,
      failed: 0,
      skipped: 0,
      processedAt: new Date().toISOString(),
    };
  }

  const client = new CoreApiClient();

  // Find tickets without multicaIssueId
  const queryResult = await client.query({
    xopureSupportTickets: {
      __args: {
        filter: { multicaIssueId: { is: 'null' } },
        first: MAX_BATCH,
      },
      edges: {
        node: {
          id: true,
          ticketNumber: true,
          subject: true,
          body: true,
          status: true,
          priority: true,
          category: true,
          requesterEmail: true,
          requesterName: true,
          productTag: true,
        },
      },
    },
  });

  type TicketNode = {
    id: string;
    ticketNumber?: string | null;
    subject?: string | null;
    body?: string | null;
    status?: string | null;
    priority?: string | null;
    category?: string | null;
    requesterEmail?: string | null;
    requesterName?: string | null;
    productTag?: string | null;
  };

  const extractTickets = (result: unknown): TicketNode[] => {
    if (typeof result !== 'object' || result === null || !('xopureSupportTickets' in result)) {
      return [];
    }
    const widening = result as Record<string, unknown>;
    const conn = widening['xopureSupportTickets'];
    if (typeof conn !== 'object' || conn === null || !('edges' in conn)) {
      return [];
    }
    const connRecord = conn as Record<string, unknown>;
    const edges = connRecord['edges'];
    if (!Array.isArray(edges)) {
      return [];
    }
    return edges
      .map((e: unknown) => {
        if (typeof e === 'object' && e !== null && 'node' in e) {
          const nodeObj = e as Record<string, unknown>;
          return nodeObj['node'];
        }
        return null;
      })
      .filter((n): n is TicketNode => n !== null && typeof n === 'object');
  };

  const tickets = extractTickets(queryResult);

  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const ticket of tickets) {
    const subject = ticket.subject ?? 'Support ticket';

    const descLines = [`Ticket: ${ticket.ticketNumber ?? ticket.id}`];
    if (ticket.requesterName || ticket.requesterEmail) {
      descLines.push(
        `Customer: ${ticket.requesterName ?? 'Unknown'}${ticket.requesterEmail ? ` <${ticket.requesterEmail}>` : ''}`,
      );
    }
    if (ticket.category) {
      descLines.push(`Category: ${ticket.category}`);
    }
    if (ticket.productTag) {
      descLines.push(`Product: ${ticket.productTag}`);
    }
    if (ticket.body) {
      descLines.push('', ticket.body);
    }

    try {
      const response = await fetch(
        `${MULTICA_API_URL}?workspace_id=${MULTICA_WORKSPACE_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `[${ticket.ticketNumber ?? '?'}] ${subject}`,
            description: descLines.join('\n'),
            priority: PRIORITY_TO_MULTICA[ticket.priority ?? ''] ?? 'medium',
            status: STATUS_TO_MULTICA[ticket.status ?? ''] ?? 'todo',
            project_id: MULTICA_PROJECT_ID,
            metadata: {
              source: 'xopure-crm-recon',
              supportTicketId: ticket.id,
              ticketNumber: ticket.ticketNumber,
            },
          }),
        },
      );

      if (!response.ok) {
        failed++;
        continue;
      }

      const issue = await response.json();
      if (typeof issue === 'object' && issue !== null && 'id' in issue && typeof issue.id === 'string') {
        await client.mutation({
          updateXopureSupportTicket: {
            __args: {
              id: ticket.id,
              data: { multicaIssueId: issue.id },
            },
            id: true,
          },
        });
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return {
    scanned: tickets.length,
    synced,
    failed,
    skipped,
    processedAt: new Date().toISOString(),
  };
};

export default defineLogicFunction({
  universalIdentifier: 'a1c4e7f8-3d5a-4b6c-9e8f-1a2b3c4d5e6f',
  name: 'multica-sync-reconciliation',
  description:
    'Finds support tickets missing a Multica issue link and syncs them.',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '*/5 * * * *',
  },
});
