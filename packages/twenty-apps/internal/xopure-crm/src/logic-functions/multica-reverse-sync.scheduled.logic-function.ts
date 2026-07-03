import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

const MULTICA_WORKSPACE_ID = 'd11337e4-0c4e-43b8-8fc8-8216c70f1427';
const MULTICA_PROJECT_ID = 'fb2e3c0e-27e0-47ac-b86d-3d2e18832fd6';
const MULTICA_API_URL = 'https://api.multica.ai/api/issues';
const LOOKBACK_MINUTES = 15;

const MULTICA_STATUS_TO_TICKET: Record<string, string> = {
  backlog: 'NEW',
  todo: 'NEW',
  in_progress: 'PENDING_CUSTOMER',
  in_review: 'PENDING_CUSTOMER',
  done: 'RESOLVED',
  cancelled: 'CLOSED',
};

const MULTICA_PRIORITY_TO_TICKET: Record<string, string> = {
  urgent: 'URGENT',
  high: 'HIGH',
  medium: 'NORMAL',
  low: 'LOW',
};

type Output = {
  scanned: number;
  updated: number;
  skipped: number;
  processedAt: string;
};

type MulticaIssue = {
  id: string;
  identifier?: string;
  title?: string;
  status?: string;
  priority?: string;
  updated_at?: string;
  metadata?: Record<string, unknown> | null;
};

const handler = async (): Promise<Output> => {
  const apiKey = process.env['MULTICA_API_KEY'];

  if (!apiKey) {
    return { scanned: 0, updated: 0, skipped: 0, processedAt: new Date().toISOString() };
  }

  const since = new Date(Date.now() - LOOKBACK_MINUTES * 60 * 1000).toISOString();

  // Poll Multica for recently updated issues in the Ticketing project
  const url = new URL(`${MULTICA_API_URL}`);
  url.searchParams.set('workspace_id', MULTICA_WORKSPACE_ID);
  url.searchParams.set('project_id', MULTICA_PROJECT_ID);
  url.searchParams.set('updated_since', since);
  url.searchParams.set('limit', '50');

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    return { scanned: 0, updated: 0, skipped: 0, processedAt: new Date().toISOString() };
  }

  const body = await response.json();
  const issues: MulticaIssue[] = Array.isArray(body) ? body : [];

  if (issues.length === 0) {
    return { scanned: 0, updated: 0, skipped: 0, processedAt: new Date().toISOString() };
  }

  const client = new CoreApiClient();
  let updated = 0;
  let skipped = 0;

  for (const issue of issues) {
    // Find the Twenty ticket linked to this Multica issue
    const findResult = await client.query({
      xopureSupportTickets: {
        __args: {
          filter: { multicaIssueId: { eq: issue.id } },
          first: 1,
        },
        edges: {
          node: {
            id: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    type FindResult = {
      xopureSupportTickets?: {
        edges?: Array<{
          node?: { id: string; status?: string | null; priority?: string | null };
        }>;
      };
    };

    const extractTicket = (result: unknown): { id: string; status?: string | null; priority?: string | null } | null => {
      if (typeof result !== 'object' || result === null || !('xopureSupportTickets' in result) ) return null;
      const widing = result as Record<string, unknown>;
      const conn = widing['xopureSupportTickets'];
      if (typeof conn !== 'object' || conn === null || !('edges' in conn)) return null;
      const connRecord = conn as Record<string, unknown>;
      const edges = connRecord['edges'];
      if (!Array.isArray(edges) || edges.length === 0) return null;
      const firstEdge = edges[0];
      if (typeof firstEdge === 'object' && firstEdge !== null && 'node' in firstEdge) {
        const edgeRecord = firstEdge as Record<string, unknown>;
        const node = edgeRecord['node'];
        if (typeof node === 'object' && node !== null && 'id' in node) {
          const nodeRecord = node as Record<string, unknown>;
          return {
            id: typeof nodeRecord['id'] === 'string' ? nodeRecord['id'] : '',
            status: typeof nodeRecord['status'] === 'string' ? nodeRecord['status'] : null,
            priority: typeof nodeRecord['priority'] === 'string' ? nodeRecord['priority'] : null,
          };
        }
      }
      return null;
    };

    const ticket = extractTicket(findResult);

    if (!ticket) {
      skipped++;
      continue;
    }

    // Map Multica status/priority to ticket status/priority
    const newStatus = issue.status ? MULTICA_STATUS_TO_TICKET[issue.status] : undefined;
    const newPriority = issue.priority ? MULTICA_PRIORITY_TO_TICKET[issue.priority] : undefined;

    // Skip if nothing to update
    if ((!newStatus || newStatus === ticket.status) && (!newPriority || newPriority === ticket.priority)) {
      skipped++;
      continue;
    }

    // Update the ticket
    const updateData: Record<string, string> = {};
    if (newStatus && newStatus !== ticket.status) {
      updateData.status = newStatus;
    }
    if (newPriority && newPriority !== ticket.priority) {
      updateData.priority = newPriority;
    }

    if (Object.keys(updateData).length > 0) {
      await client.mutation({
        updateXopureSupportTicket: {
          __args: {
            id: ticket.id,
            data: updateData,
          },
          id: true,
        },
      });
      updated++;
    } else {
      skipped++;
    }
  }

  return {
    scanned: issues.length,
    updated,
    skipped,
    processedAt: new Date().toISOString(),
  };
};

export default defineLogicFunction({
  universalIdentifier: 'b2d5e8f9-4e6b-4c7d-af90-2b3c4d5e6f70',
  name: 'multica-reverse-sync',
  description:
    'Polls Multica for recently updated issues and syncs status/priority back to Twenty tickets.',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '*/10 * * * *',
  },
});
