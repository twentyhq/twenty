import type { TwentyClientLike } from 'src/supabase-sync/types/twenty-client-like.type';
import { extractConnection } from 'src/supabase-sync/utils/extract-twenty-result';

type ReconciliationInput = {
  client: TwentyClientLike;
};

type ReconciliationDetail = {
  syncKey: string;
  sourceTable: string;
  sourceRecordId: string;
  issue: string;
};

export type ReconciliationReport = {
  ok: boolean;
  totalSyncMaps: number;
  staleRecords: number;
  failedRecords: number;
  healthyRecords: number;
  details: Array<ReconciliationDetail>;
  runAt: string;
};

type SyncMapNode = {
  id: string;
  syncKey: string;
  sourceTable: string;
  sourceRecordId: string;
  targetObject: string;
  lastStatus: string;
  lastSyncedAt: string;
  lastErrorSummary: string;
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const classifyRecord = (
  node: SyncMapNode,
  now: number,
): { issue: string | null } => {
  if (node.lastStatus === 'failed') {
    return { issue: 'status_failed' };
  }

  if (node.lastErrorSummary) {
    return { issue: 'has_error_summary' };
  }

  if (node.lastSyncedAt) {
    const lastSynced = new Date(node.lastSyncedAt).getTime();
    if (now - lastSynced > TWENTY_FOUR_HOURS_MS) {
      return { issue: 'stale_synced_at' };
    }
  }

  return { issue: null };
};

export const handleSyncReconciliation = async (
  input: ReconciliationInput,
): Promise<ReconciliationReport> => {
  const { client } = input;
  const now = Date.now();

  const result = await client.query({
    xopureSyncMaps: {
      __args: {
        first: 100,
      },
      edges: {
        node: {
          id: true,
          syncKey: true,
          sourceTable: true,
          sourceRecordId: true,
          targetObject: true,
          lastStatus: true,
          lastSyncedAt: true,
          lastErrorSummary: true,
        },
      },
    },
  });

  const connection = extractConnection<SyncMapNode>(result, 'xopureSyncMaps');
  const nodes = connection.edges.map((edge) => edge.node);

  const details: Array<ReconciliationDetail> = [];
  let staleRecords = 0;
  let failedRecords = 0;
  let healthyRecords = 0;

  for (const node of nodes) {
    const { issue } = classifyRecord(node, now);

    if (!issue) {
      healthyRecords++;
      continue;
    }

    if (issue === 'status_failed') {
      failedRecords++;
    } else {
      staleRecords++;
    }

    details.push({
      syncKey: node.syncKey,
      sourceTable: node.sourceTable,
      sourceRecordId: node.sourceRecordId,
      issue,
    });
  }

  const report: ReconciliationReport = {
    ok: failedRecords === 0 && staleRecords === 0,
    totalSyncMaps: nodes.length,
    staleRecords,
    failedRecords,
    healthyRecords,
    details,
    runAt: new Date(now).toISOString(),
  };

  console.info('xopure_reconciliation_run', report);

  return report;
};
