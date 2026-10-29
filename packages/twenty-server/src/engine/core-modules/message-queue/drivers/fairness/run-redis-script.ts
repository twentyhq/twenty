import { createHash } from 'node:crypto';

import { type RedisClient } from 'bullmq';
import { isDefined } from 'twenty-shared/utils';

const scriptShas = new Map<string, string>();

const getScriptSha = (script: string): string => {
  const cachedScriptSha = scriptShas.get(script);

  if (isDefined(cachedScriptSha)) {
    return cachedScriptSha;
  }

  const scriptSha = createHash('sha1').update(script).digest('hex');

  scriptShas.set(script, scriptSha);

  return scriptSha;
};

export const runRedisScript = async ({
  client,
  script,
  keys,
  args,
}: {
  client: RedisClient;
  script: string;
  keys: string[];
  args: (string | number)[];
}): Promise<unknown> =>
  client
    .runCommand('evalsha', [
      getScriptSha(script),
      keys.length,
      ...keys,
      ...args,
    ])
    .catch((error: unknown) => {
      if (!(error instanceof Error && error.message.startsWith('NOSCRIPT'))) {
        throw error;
      }

      return client.runCommand('eval', [script, keys.length, ...keys, ...args]);
    });
