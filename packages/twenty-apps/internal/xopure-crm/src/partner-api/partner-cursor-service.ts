import type { TwentyClientLike } from '../supabase-sync/types/twenty-client-like.type';
import { extractConnection } from '../supabase-sync/utils/extract-twenty-result';

export type CursorStep =
  | 'partner-shipments'
  | 'partner-orders'
  | 'partner-ambassadors';

export type CursorState = {
  step: string;
  cursorValue: string | null;
  lastRunStatus: string;
  lastRunAt: string | null;
  lastErrorSummary: string | null;
};

type CursorQueryNode = {
  id: string;
  step?: string;
  cursorValue?: string | null;
  lastRunStatus?: string;
  lastRunAt?: string | null;
  lastErrorSummary?: string | null;
};

export const getCursor = async (
  client: TwentyClientLike,
  step: CursorStep,
): Promise<(CursorState & { id: string }) | null> => {
  const result = await client.query({
    xopureSyncCursors: {
      __args: {
        filter: { step: { eq: step } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          step: true,
          cursorValue: true,
          lastRunStatus: true,
          lastRunAt: true,
          lastErrorSummary: true,
        },
      },
    },
  });

  const connection = extractConnection<CursorQueryNode>(result, 'xopureSyncCursors');
  const node = connection.edges[0]?.node;

  if (!node) return null;

  return {
    id: node.id,
    step: node.step ?? step,
    cursorValue: node.cursorValue ?? null,
    lastRunStatus: node.lastRunStatus ?? 'UNKNOWN',
    lastRunAt: node.lastRunAt ?? null,
    lastErrorSummary: node.lastErrorSummary ?? null,
  };
};

export const getWatermark = async (
  client: TwentyClientLike,
  step: CursorStep,
): Promise<string | undefined> => {
  const cursor = await getCursor(client, step);
  return cursor ? (cursor.cursorValue ?? undefined) : undefined;
};

export const saveCursor = async (
  client: TwentyClientLike,
  step: CursorStep,
  value: string | null,
  status: string,
  errorSummary?: string | null,
): Promise<void> => {
  const existing = await getCursor(client, step);
  const nowIso = new Date().toISOString();

  const data = {
    step,
    cursorValue: value,
    lastRunStatus: status,
    lastRunAt: nowIso,
    lastErrorSummary: errorSummary ?? null,
  };

  if (existing) {
    await client.mutation({
      updateXopureSyncCursor: {
        __args: {
          id: existing.id,
          data,
        },
        id: true,
      },
    });
  } else {
    await client.mutation({
      createXopureSyncCursor: {
        __args: { data },
        id: true,
      },
    });
  }
};
