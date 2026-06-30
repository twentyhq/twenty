import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { CONTAINER_NAME } from '@/cli/utilities/server/docker-container';

const execFileAsync = promisify(execFile);

export const getLocalServerVersion = async (
  containerName: string = CONTAINER_NAME,
): Promise<string | null> => {
  try {
    const { stdout } = await execFileAsync(
      'docker',
      [
        'inspect',
        '-f',
        '{{range .Config.Env}}{{println .}}{{end}}',
        containerName,
      ],
      { encoding: 'utf-8' },
    );

    const match = stdout.match(/^APP_VERSION=(.+)$/m);

    if (!match || match[1] === '0.0.0' || match[1] === '') {
      return null;
    }

    return match[1].trim().replace(/^v/, '');
  } catch {
    return null;
  }
};
