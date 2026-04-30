import { CoreApiClient } from 'twenty-client-sdk/core';

export const getClient = () => new CoreApiClient();

const BATCH_CHUNK_SIZE = 50;

export async function chunkedBatchCreate<T extends Record<string, unknown>>(
  mutationName: string,
  items: T[],
  returnFields: Record<string, true | Record<string, true>>,
): Promise<Record<string, unknown>[]> {
  if (items.length === 0) return [];

  const client = getClient();
  const results: Record<string, unknown>[] = [];
  const totalChunks = Math.ceil(items.length / BATCH_CHUNK_SIZE);
  const overallStart = Date.now();

  for (let i = 0; i < items.length; i += BATCH_CHUNK_SIZE) {
    const chunk = items.slice(i, i + BATCH_CHUNK_SIZE);
    const chunkIndex = Math.floor(i / BATCH_CHUNK_SIZE) + 1;
    const chunkStart = Date.now();

    const res = await client.mutation({
      [mutationName]: {
        __args: { data: chunk, upsert: true },
        ...returnFields,
      },
    });

    const chunkMs = Date.now() - chunkStart;
    console.log(
      `[timing] ${mutationName} chunk ${chunkIndex}/${totalChunks} (${chunk.length} rows) in ${chunkMs}ms`,
    );

    const rows = res[mutationName];
    if (Array.isArray(rows)) {
      results.push(...(rows as Record<string, unknown>[]));
    }
  }

  const totalMs = Date.now() - overallStart;
  console.log(
    `[timing] ${mutationName} total ${items.length} rows in ${totalMs}ms (${totalChunks} chunk(s))`,
  );

  return results;
}
