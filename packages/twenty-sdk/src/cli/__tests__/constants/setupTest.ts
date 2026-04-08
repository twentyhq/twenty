import { writeFile } from 'node:fs/promises';
import * as path from 'path';
import { beforeAll } from 'vitest';

import { ensureDir } from '@/cli/utilities/file/fs-utils';
import { getConfigPath } from '@/cli/utilities/config/get-config-path';

const testConfigPath = getConfigPath(true);

beforeAll(async () => {
  const apiUrl = process.env.TWENTY_API_URL;
  const token = process.env.TWENTY_API_KEY;

  if (!apiUrl || !token) {
    throw new Error(
      'TWENTY_API_URL and TWENTY_API_KEY must be set.\n' +
        'Run: twenty server start --test\n' +
        'Or set them in vitest env config.',
    );
  }

  const response = await fetch(`${apiUrl}/healthz`).catch(() => null);

  if (!response?.ok) {
    throw new Error(
      `Twenty server not reachable at ${apiUrl}. ` +
        'Run: twenty server start --test',
    );
  }

  await ensureDir(path.dirname(testConfigPath));

  await writeFile(
    testConfigPath,
    JSON.stringify(
      {
        remotes: {
          local: { apiUrl, apiKey: token },
        },
        defaultRemote: 'local',
      },
      null,
      2,
    ),
  );

  process.env.TWENTY_APP_ACCESS_TOKEN ??= token;
});
