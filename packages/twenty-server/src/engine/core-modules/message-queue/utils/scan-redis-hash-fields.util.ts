import { type RedisScriptClient } from 'src/engine/core-modules/message-queue/utils/run-redis-script.util';

export async function* scanRedisHashFields({
  client,
  key,
  batchSize,
}: {
  client: RedisScriptClient;
  key: string;
  batchSize: number;
}): AsyncGenerator<string[]> {
  let cursor = '0';

  do {
    const [nextCursor, fieldsAndValues] = (await client.runCommand('hscan', [
      key,
      cursor,
      'COUNT',
      batchSize,
    ])) as [string, string[]];
    const fields = fieldsAndValues.filter((_, index) => index % 2 === 0);

    if (fields.length > 0) {
      yield fields;
    }

    cursor = String(nextCursor);
  } while (cursor !== '0');
}
