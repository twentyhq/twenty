import { type RedisScriptClient } from 'src/engine/core-modules/message-queue/utils/run-redis-script.util';

export async function* scanRedisHashEntries({
  client,
  key,
  batchSize,
}: {
  client: RedisScriptClient;
  key: string;
  batchSize: number;
}): AsyncGenerator<{ field: string; value: string }[]> {
  let cursor = '0';

  do {
    const [nextCursor, fieldsAndValues] = (await client.runCommand('hscan', [
      key,
      cursor,
      'COUNT',
      batchSize,
    ])) as [string, string[]];
    const entries = fieldsAndValues.flatMap((field, index) =>
      index % 2 === 0 ? [{ field, value: fieldsAndValues[index + 1] }] : [],
    );

    if (entries.length > 0) {
      yield entries;
    }

    cursor = String(nextCursor);
  } while (cursor !== '0');
}
