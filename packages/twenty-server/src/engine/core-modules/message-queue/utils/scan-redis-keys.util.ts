import { type RedisScriptClient } from 'src/engine/core-modules/message-queue/utils/run-redis-script.util';

export async function* scanRedisKeys({
  client,
  pattern,
}: {
  client: RedisScriptClient;
  pattern: string;
}): AsyncGenerator<string> {
  let cursor = '0';

  do {
    const [nextCursor, keys] = (await client.runCommand('scan', [
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      200,
    ])) as [string, string[]];

    yield* keys;
    cursor = String(nextCursor);
  } while (cursor !== '0');
}
