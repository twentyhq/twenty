import { execSync } from 'node:child_process';

import {
  CONTAINER_NAME,
  containerExists,
} from '@/cli/utilities/server/docker-container';

export const getLocalServerVersion = (
  containerName: string = CONTAINER_NAME,
): string | null => {
  if (!containerExists(containerName)) {
    return null;
  }

  try {
    const result = execSync(
      `docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' ${containerName}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    );

    const match = result.match(/^APP_VERSION=(.+)$/m);

    if (!match || match[1] === '0.0.0' || match[1] === '') {
      return null;
    }

    return match[1].trim().replace(/^v/, '');
  } catch {
    return null;
  }
};
