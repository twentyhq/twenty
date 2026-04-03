import { execSync } from 'node:child_process';

export const CONTAINER_NAME = 'twenty-app-dev';
export const IMAGE = 'twentycrm/twenty-app-dev:latest';
export const DEFAULT_PORT = 2020;

export const isContainerRunning = (): boolean => {
  try {
    const result = execSync(
      `docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    ).trim();

    return result === 'true';
  } catch {
    return false;
  }
};

export const getContainerPort = (): number => {
  try {
    const result = execSync(
      `docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' ${CONTAINER_NAME}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    );

    const match = result.match(/^NODE_PORT=(\d+)$/m);

    return match ? parseInt(match[1], 10) : DEFAULT_PORT;
  } catch {
    return DEFAULT_PORT;
  }
};

export const containerExists = (): boolean => {
  try {
    execSync(`docker inspect ${CONTAINER_NAME}`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    return true;
  } catch {
    return false;
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
