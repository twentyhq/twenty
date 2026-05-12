import { execSync } from 'node:child_process';

import { openBrowser } from '@/cli/utilities/auth/open-browser';

const DOCKER_DOWNLOAD_URLS: Record<string, string> = {
  darwin: 'https://docs.docker.com/desktop/setup/install/mac-install/',
  win32: 'https://docs.docker.com/desktop/setup/install/windows-install/',
  linux: 'https://docs.docker.com/engine/install/',
};

const DOCKER_COMPATIBLE_COMMANDS = ['docker', 'podman', 'nerdctl'];

export const isDockerInstalled = (): boolean => {
  return DOCKER_COMPATIBLE_COMMANDS.some((cmd) => {
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });

      return true;
    } catch {
      return false;
    }
  });
};

export const openDockerInstallPage = async (
  onProgress?: (message: string) => void,
): Promise<void> => {
  const url =
    DOCKER_DOWNLOAD_URLS[process.platform] ?? DOCKER_DOWNLOAD_URLS.linux;

  onProgress?.(`Opening Docker install page: ${url}`);

  const opened = await openBrowser(url);

  if (!opened) {
    onProgress?.(`Could not open browser. Visit: ${url}`);
  }
};

export const getDockerInstallInstructions = (): string => {
  const url =
    DOCKER_DOWNLOAD_URLS[process.platform] ?? DOCKER_DOWNLOAD_URLS.linux;

  return [
    'Docker is required but not installed.',
    '',
    `Install Docker: ${url}`,
    '',
    'Then run this command again.',
  ].join('\n');
};
