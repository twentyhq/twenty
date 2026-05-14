import { execSync } from 'node:child_process';

const DOCKER_DOWNLOAD_URLS: Record<string, string> = {
  darwin: 'https://docs.docker.com/desktop/setup/install/mac-install/',
  win32: 'https://docs.docker.com/desktop/setup/install/windows-install/',
  linux: 'https://docs.docker.com/engine/install/',
};

export const isDockerInstalled = (): boolean => {
  try {
    execSync('docker --version', { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
};

export const getDockerInstallInstructions = (): string => {
  const url =
    DOCKER_DOWNLOAD_URLS[process.platform] ?? DOCKER_DOWNLOAD_URLS.linux;

  return [
    '  Docker is required but not installed.',
    '',
    `  Install Docker: ${url}`,
    '',
    '  Then run this command again.',
    '',
    '  Alternatively, connect to an existing Twenty instance:',
    '  npx create-twenty-app@latest my-twenty-app --api-url <your-instance-url>',
  ].join('\n');
};
