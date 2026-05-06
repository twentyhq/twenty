import { execSync } from 'node:child_process';

export const CONTAINER_NAME = 'twenty-app-dev';
export const TEST_CONTAINER_NAME = 'twenty-app-dev-test';
export const IMAGE = 'twentycrm/twenty-app-dev:latest';
export const DEFAULT_PORT = 2020;
export const DEFAULT_TEST_PORT = 2021;

export const isContainerRunning = (containerName = CONTAINER_NAME): boolean => {
  try {
    const result = execSync(
      `docker inspect -f '{{.State.Running}}' ${containerName}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    ).trim();

    return result === 'true';
  } catch {
    return false;
  }
};

export const getContainerPort = (containerName = CONTAINER_NAME): number => {
  const defaultPort =
    containerName === TEST_CONTAINER_NAME ? DEFAULT_TEST_PORT : DEFAULT_PORT;

  try {
    const result = execSync(
      `docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' ${containerName}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    );

    const match = result.match(/^NODE_PORT=(\d+)$/m);

    return match ? parseInt(match[1], 10) : defaultPort;
  } catch {
    return defaultPort;
  }
};

export const containerExists = (containerName = CONTAINER_NAME): boolean => {
  try {
    execSync(`docker inspect ${containerName}`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    return true;
  } catch {
    return false;
  }
};

export const getImageForVersion = (version = 'latest'): string =>
  `twentycrm/twenty-app-dev:${version}`;

export const getContainerDigest = (
  containerName = CONTAINER_NAME,
): string | null => {
  try {
    return execSync(`docker inspect -f '{{.Image}}' ${containerName}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
};

export const getImageDigest = (image: string): string | null => {
  try {
    return execSync(`docker inspect -f '{{.Id}}' ${image}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
};

export const getContainerEnvVar = (
  envVar: string,
  containerName = CONTAINER_NAME,
): string | null => {
  try {
    const result = execSync(
      `docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' ${containerName}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    );

    const match = result.match(new RegExp(`^${envVar}=(.+)$`, 'm'));

    return match ? match[1] : null;
  } catch {
    return null;
  }
};

export const checkDockerRunning = (): boolean => {
  try {
    execSync('docker info', { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
};

const getDockerStartInstruction = (): string => {
  switch (process.platform) {
    case 'darwin':
      return '  Run: open -a Docker\n  (or launch Docker Desktop from Applications)';
    case 'linux':
      return '  Run: sudo systemctl start docker\n  (or launch Docker Desktop if installed)';
    case 'win32':
      return '  Launch Docker Desktop from the Start menu';
    default:
      return '  See https://docs.docker.com/engine/install/ for installation';
  }
};

export const getDockerNotRunningMessage = (retryCommand: string): string =>
  [
    'Docker is not running.',
    '',
    'Start Docker:',
    getDockerStartInstruction(),
    '',
    'Then retry:',
    `  ${retryCommand}`,
    '',
    "Don't have Docker? Install from https://docs.docker.com/get-docker/",
  ].join('\n');
