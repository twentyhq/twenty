import { writeFile } from 'node:fs/promises';
import * as path from 'path';
import { beforeAll } from 'vitest';

import { ensureDir } from '@/cli/utilities/file/fs-utils';
import { getConfigPath } from '@/cli/utilities/config/get-config-path';

const testConfigPath = getConfigPath();

beforeAll(async () => {
  await ensureDir(path.dirname(testConfigPath));

  const configFile = {
    remotes: {
      local: {
        apiUrl: process.env.TWENTY_API_URL,
        apiKey: process.env.TWENTY_API_KEY,
      },
    },
    defaultRemote: 'local',
  };

  await writeFile(testConfigPath, JSON.stringify(configFile, null, 2));
});
