import type {
  MulticaIssue,
  UpdateIssueResult,
} from 'src/logic-functions/types/multica.types';

const WORKSPACE_ID = 'd11337e4-0c4e-43b8-8fc8-8216c70f1427';

export interface UpdateIssueInput {
  multicaIssueId: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  assignee_id?: string;
  start_date?: string;
  due_date?: string;
  metadata?: Record<string, unknown>;
  /** Set by database-event triggers to detect webhook-initiated updates. */
  lastSyncedFromMulticaAt?: string;
}

/**
 * If the ticket's lastSyncedFromMulticaAt was set within this window (ms),
 * the update was initiated by the inbound webhook — do not push outward.
 */
const LOOP_GUARD_WINDOW_MS = 10_000;

/** Normalize Twenty ticket status/priority (UPPER) → Multica (lowercase). */
const REVERSE_STATUS_MAP: Record<string, string> = {
  OPEN: 'backlog',
  IN_PROGRESS: 'in_progress',
  WAITING: 'in_progress',
  RESOLVED: 'done',
  CLOSED: 'cancelled',
};

const REVERSE_PRIORITY_MAP: Record<string, string> = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

const normalizeOutbound = (input: UpdateIssueInput): UpdateIssueInput => {
  const normalized = { ...input };
  if (normalized.status && REVERSE_STATUS_MAP[normalized.status]) {
    normalized.status = REVERSE_STATUS_MAP[normalized.status];
  } else if (normalized.status && /^[a-z_]+$/.test(normalized.status)) {
    // Already Multica-format (lowercase), pass through
  } else if (normalized.status) {
    normalized.status = normalized.status.toLowerCase();
  }
  if (normalized.priority && REVERSE_PRIORITY_MAP[normalized.priority]) {
    normalized.priority = REVERSE_PRIORITY_MAP[normalized.priority];
  } else if (normalized.priority) {
    normalized.priority = normalized.priority.toLowerCase();
  }
  return normalized;
};

export const updateMulticaIssueHandler = async (
  input: UpdateIssueInput,
): Promise<UpdateIssueResult> => {
  const apiKey = process.env.MULTICA_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Missing MULTICA_API_KEY environment variable.',
    };
  }

  if (!input.multicaIssueId || input.multicaIssueId.trim().length === 0) {
    return {
      success: false,
      error: '`multicaIssueId` is required.',
    };
  }

  // Loop guard: if this update was triggered by the Multica webhook receiver,
  // lastSyncedFromMulticaAt will be fresh — skip the outward push.
  if (input.lastSyncedFromMulticaAt) {
    const syncedAt = new Date(input.lastSyncedFromMulticaAt).getTime();
    const now = Date.now();
    if (now - syncedAt < LOOP_GUARD_WINDOW_MS) {
      return {
        success: false,
        error: 'Skipped — record was just synced from Multica (loop guard).',
      };
    }
  }

  try {
    // Normalize Twenty-format values to Multica-format before sending
    const normalized = normalizeOutbound(input);

    const response = await fetch(
      `https://api.multica.ai/api/issues/${encodeURIComponent(input.multicaIssueId)}?workspace_id=${WORKSPACE_ID}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(normalized.title !== undefined && { title: normalized.title }),
          ...(normalized.description !== undefined && {
            description: normalized.description,
          }),
          ...(normalized.priority !== undefined && { priority: normalized.priority }),
          ...(normalized.status !== undefined && { status: normalized.status }),
          ...(normalized.assignee_id !== undefined && {
            assignee_id: normalized.assignee_id,
          }),
          ...(normalized.start_date !== undefined && {
            start_date: normalized.start_date,
          }),
          ...(normalized.due_date !== undefined && { due_date: normalized.due_date }),
          ...(normalized.metadata !== undefined && { metadata: normalized.metadata }),
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      return {
        success: false,
        error: `Multica API returned ${response.status}: ${errorBody}`,
      };
    }

    const issue = (await response.json()) as MulticaIssue;
    return { success: true, issue };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown network error';
    return { success: false, error: message };
  }
};
