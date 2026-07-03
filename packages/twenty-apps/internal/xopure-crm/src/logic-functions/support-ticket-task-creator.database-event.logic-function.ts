import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

const MULTICA_WORKSPACE_ID = 'd11337e4-0c4e-43b8-8fc8-8216c70f1427';
const MULTICA_PROJECT_ID = 'fb2e3c0e-27e0-47ac-b86d-3d2e18832fd6';
const MULTICA_API_URL = 'https://api.multica.ai/api/issues';

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

type SupportTicketRecord = {
  id?: string;
  subject?: string | null;
  body?: string | null;
  status?: string | null;
  priority?: string | null;
  category?: string | null;
  ticketType?: string | null;
  productTag?: string | null;
  ticketNumber?: string | null;
  supabaseTicketId?: string | null;
  requesterEmail?: string | null;
  requesterName?: string | null;
  requesterPhone?: string | null;
  messageCount?: number | null;
  slaDeadline?: string | null;
  slaBreached?: boolean | null;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  lastActivityAt?: string | null;
  multicaIssueId?: string | null;
};

type Input = {
  record?: SupportTicketRecord | null;
};

type Output = {
  success: boolean;
  taskId?: string;
  supportTicketId?: string;
  multicaIssueId?: string;
  multicaError?: string;
  processedAt: string;
};

/**
 * Extract a string `id` from a CoreApiClient mutation result.
 * Uses `in` narrowing — no unchecked casts on external data.
 */
function extractId(result: unknown, key: string): string | undefined {
  if (typeof result !== 'object' || result === null || !(key in result)) {
    return undefined;
  }
  // Widening cast for dynamic-key access after a verified `in` check.
  const record = result as Record<string, unknown>;
  const node = record[key];
  if (typeof node !== 'object' || node === null || !('id' in node)) {
    return undefined;
  }
  return typeof node.id === 'string' ? node.id : undefined;
}

/** Build a rich issue description from all available ticket context. */
function buildDescription(r: SupportTicketRecord): string {
  const lines: string[] = [];

  lines.push(`Ticket: ${r.ticketNumber ?? r.supabaseTicketId ?? r.id ?? '?'}`);

  if (r.requesterName || r.requesterEmail) {
    const name = r.requesterName ?? 'Unknown';
    const email = r.requesterEmail ?? '';
    lines.push(`Customer: ${name}${email ? ` <${email}>` : ''}`);
  }

  if (r.requesterPhone) {
    lines.push(`Phone: ${r.requesterPhone}`);
  }

  if (r.category) {
    lines.push(`Category: ${r.category}`);
  }

  if (r.productTag) {
    lines.push(`Product: ${r.productTag}`);
  }

  if (r.slaDeadline) {
    const breached = r.slaBreached ? ' (SLA BREACHED)' : '';
    lines.push(`SLA: ${r.slaDeadline}${breached}`);
  }

  if (r.body) {
    lines.push('');
    lines.push(r.body);
  }

  return lines.join('\n');
}

/** Collect all non-null ticket fields into a metadata object for Multica. */
function buildMetadata(
  r: SupportTicketRecord,
  taskId: string | undefined,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    source: 'xopure-crm',
    supportTicketId: r.id,
    taskId,
  };

  const optionalFields: Array<readonly [string, unknown]> = [
    ['ticketNumber', r.ticketNumber],
    ['supabaseTicketId', r.supabaseTicketId],
    ['category', r.category],
    ['ticketType', r.ticketType],
    ['productTag', r.productTag],
    ['requesterEmail', r.requesterEmail],
    ['requesterName', r.requesterName],
    ['requesterPhone', r.requesterPhone],
    ['messageCount', r.messageCount],
    ['slaDeadline', r.slaDeadline],
    ['slaBreached', r.slaBreached],
    ['firstResponseAt', r.firstResponseAt],
    ['resolvedAt', r.resolvedAt],
    ['closedAt', r.closedAt],
    ['lastActivityAt', r.lastActivityAt],
    ['ticketStatus', r.status],
    ['ticketPriority', r.priority],
  ];

  for (const [key, value] of optionalFields) {
    if (value !== null && value !== undefined) {
      metadata[key] = value;
    }
  }

  return metadata;
}

export const handler = async (input: Input): Promise<Output> => {
  const supportTicketId = input.record?.id;
  const jobType = 'support-ticket-task-creator';
  const startTime = Date.now();

  console.log(JSON.stringify({
    type: 'JOB_START',
    job_type: jobType,
    support_ticket_id: supportTicketId,
    timestamp: new Date().toISOString(),
  }));

  try {
    const client = new CoreApiClient();
    const subject = input.record?.subject ?? 'New ticket';
    const dueAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    // --- Step 1: Create the Twenty Task ---
    const taskResult = await client.mutation({
      createTask: {
        __args: {
          data: {
            body: `Follow up on support ticket: ${subject}`,
            dueAt,
          },
        },
        id: true,
      },
    });

    const taskId = extractId(taskResult, 'createTask');

    if (taskId && supportTicketId) {
      await client.mutation({
        createTaskTarget: {
          __args: {
            data: {
              taskId,
              targetXopureSupportTicketId: supportTicketId,
            },
          },
          id: true,
        },
      });
    }

    // --- Step 2: Create the Multica Issue (idempotent — skip if already linked) ---
    let multicaIssueId: string | undefined;
    let multicaError: string | undefined;

    if (input.record?.multicaIssueId) {
      multicaIssueId = input.record.multicaIssueId;
    } else {
      let apiKey = process.env['MULTICA_API_KEY'];
      if (!apiKey) {
        try { apiKey = String(require('fs').readFileSync('/app/packages/twenty-server/.local-storage/.multica-pat', 'utf8')).trim(); } catch {}
      }

      if (!apiKey) {
        multicaError =
          'Missing MULTICA_API_KEY — task created, Multica sync skipped.';
      } else {
        try {
          const multicaStatus = input.record?.status
            ? (STATUS_TO_MULTICA[input.record.status] ?? 'todo')
            : 'todo';
          const multicaPriority = input.record?.priority
            ? (PRIORITY_TO_MULTICA[input.record.priority] ?? 'medium')
            : 'medium';

          const response = await fetch(
            `${MULTICA_API_URL}?workspace_id=${MULTICA_WORKSPACE_ID}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: subject,
                description: buildDescription(input.record ?? {}),
                priority: multicaPriority,
                status: multicaStatus,
                project_id: MULTICA_PROJECT_ID,
                metadata: buildMetadata(input.record ?? {}, taskId),
              }),
            },
          );

          if (!response.ok) {
            const errorBody = await response.text().catch(() => 'Unknown error');
            multicaError = `Multica API returned ${response.status}: ${errorBody}`;
          } else {
            const issue = await response.json();
            if (
              typeof issue === 'object' &&
              issue !== null &&
              'id' in issue &&
              typeof issue.id === 'string'
            ) {
              multicaIssueId = issue.id;

              // Write back multicaIssueId to the support ticket record
              if (supportTicketId) {
                await client.mutation({
                  updateXopureSupportTicket: {
                    __args: {
                      id: supportTicketId,
                      data: { multicaIssueId },
                    },
                    id: true,
                  },
                });
              }
            } else {
              multicaError = 'Multica API returned no issue id.';
            }
          }
        } catch (err) {
          multicaError =
            err instanceof Error ? err.message : 'Unknown network error';
        }
      }
    }

    const durationMs = Date.now() - startTime;

    console.log(JSON.stringify({
      type: 'JOB_COMPLETE',
      job_type: jobType,
      support_ticket_id: supportTicketId,
      task_id: taskId,
      multica_issue_id: multicaIssueId,
      duration_ms: durationMs,
      records_processed: 1,
      records_failed: multicaError ? 1 : 0,
      timestamp: new Date().toISOString(),
    }));

    return {
      success: true,
      taskId,
      supportTicketId,
      multicaIssueId,
      multicaError,
      processedAt: new Date().toISOString(),
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;

    console.log(JSON.stringify({
      type: 'JOB_FAIL',
      job_type: jobType,
      support_ticket_id: supportTicketId,
      duration_ms: durationMs,
      error_code: 'UNHANDLED_ERROR',
      timestamp: new Date().toISOString(),
    }));

    throw err;
  }
};

export default defineLogicFunction({
  universalIdentifier: '48400dd3-e1a7-4ef0-a7cb-2e165a3dc25b',
  name: 'support-ticket-task-creator',
  description:
    'Auto-creates a Task and a Multica issue when a support ticket is created.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'xopureSupportTicket.created',
  },
});
