import type { TwentyClientLike } from 'src/supabase-sync/types/twenty-client-like.type';
import { extractConnection } from 'src/supabase-sync/utils/extract-twenty-result';

export type SyncHealthReport = {
  ok: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  syncMapSummary: {
    total: number;
    byStatus: Record<string, number>;
    lastSyncAt: string | null;
  };
  cursors: Array<{
    step: string;
    lastRunStatus: string;
    lastRunAt: string | null;
    lastErrorSummary: string | null;
  }>;
  checkedAt: string;
};

type SyncMapNode = {
  lastStatus: string;
  lastSyncedAt: string | null;
};

type CursorNode = {
  step: string;
  lastRunStatus: string;
  lastRunAt: string | null;
  lastErrorSummary: string | null;
};

type HandlerInput = {
  client: TwentyClientLike;
};

type HandlerResponse = {
  statusCode: number;
  body: SyncHealthReport;
};

const ONE_HOUR_MS = 60 * 60 * 1000;

const computeHealth = (
  total: number,
  byStatus: Record<string, number>,
  lastSyncAt: string | null,
): 'healthy' | 'degraded' | 'unhealthy' => {
  if (total === 0) {
    return 'unhealthy';
  }

  const failedCount = byStatus['failed'] ?? 0;
  const failedRatio = failedCount / total;

  if (failedRatio >= 0.1) {
    return 'unhealthy';
  }

  if (failedCount > 0) {
    return 'degraded';
  }

  if (lastSyncAt) {
    const lastSyncTime = new Date(lastSyncAt).getTime();
    const now = Date.now();

    if (now - lastSyncTime > ONE_HOUR_MS) {
      return 'unhealthy';
    }
  } else {
    return 'unhealthy';
  }

  return 'healthy';
};

export const handleSyncHealth = async (
  input: HandlerInput,
): Promise<HandlerResponse> => {
  const { client } = input;
  const checkedAt = new Date().toISOString();

  const syncMapResult = await client.query({
    xopureSyncMaps: {
      __args: {
        first: 1000,
      },
      edges: {
        node: {
          lastStatus: true,
          lastSyncedAt: true,
        },
      },
    },
  });

  const syncMapConnection = extractConnection<SyncMapNode>(
    syncMapResult,
    'xopureSyncMaps',
  );

  const byStatus: Record<string, number> = {};
  let lastSyncAt: string | null = null;

  for (const edge of syncMapConnection.edges) {
    const node = edge.node;
    const status = node.lastStatus;
    byStatus[status] = (byStatus[status] ?? 0) + 1;

    if (node.lastSyncedAt) {
      if (!lastSyncAt || node.lastSyncedAt > lastSyncAt) {
        lastSyncAt = node.lastSyncedAt;
      }
    }
  }

  const total = syncMapConnection.edges.length;

  const cursorResult = await client.query({
    xopureSyncCursors: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          step: true,
          lastRunStatus: true,
          lastRunAt: true,
          lastErrorSummary: true,
        },
      },
    },
  });

  const cursorConnection = extractConnection<CursorNode>(
    cursorResult,
    'xopureSyncCursors',
  );

  const cursors = cursorConnection.edges.map((edge) => ({
    step: edge.node.step,
    lastRunStatus: edge.node.lastRunStatus,
    lastRunAt: edge.node.lastRunAt,
    lastErrorSummary: edge.node.lastErrorSummary,
  }));

  const status = computeHealth(total, byStatus, lastSyncAt);

  const report: SyncHealthReport = {
    ok: status === 'healthy',
    status,
    syncMapSummary: {
      total,
      byStatus,
      lastSyncAt,
    },
    cursors,
    checkedAt,
  };

  return {
    statusCode: status === 'unhealthy' ? 503 : 200,
    body: report,
  };
};
