import { BATCH_SIZE } from 'src/constants/batch-sizes.constant';
import { chunk } from 'src/logic-functions/data/chunk.util';
import { executeWithRetry } from 'src/logic-functions/data/execute-with-retry.util';

type RecordConnection<TNode> = {
  edges?: { node: TNode }[] | null;
} | null;

export const queryEdgesInBatches = async <TItem, TNode>(
  items: TItem[],
  query: (batch: TItem[]) => Promise<RecordConnection<TNode> | undefined>,
  batchSize: number = BATCH_SIZE,
): Promise<TNode[]> => {
  const nodes: TNode[] = [];

  for (const batch of chunk(items, batchSize)) {
    const connection = await executeWithRetry(() => query(batch));

    for (const edge of connection?.edges ?? []) {
      nodes.push(edge.node);
    }
  }

  return nodes;
};
