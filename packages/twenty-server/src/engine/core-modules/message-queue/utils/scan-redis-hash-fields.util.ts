import { type RedisScriptClient } from 'src/engine/core-modules/message-queue/utils/run-redis-script.util';
import { scanRedisHashEntries } from 'src/engine/core-modules/message-queue/utils/scan-redis-hash-entries.util';

export async function* scanRedisHashFields({
  client,
  key,
  batchSize,
}: {
  client: RedisScriptClient;
  key: string;
  batchSize: number;
}): AsyncGenerator<string[]> {
  for await (const entries of scanRedisHashEntries({
    client,
    key,
    batchSize,
  })) {
    yield entries.map(({ field }) => field);
  }
}
