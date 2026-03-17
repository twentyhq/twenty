import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync, spawnSync } from 'node:child_process';
import { isDefined } from 'twenty-shared/utils';

const CONTAINER_NAME = 'twenty-dev';
const IMAGE = 'twentycrm/twenty-dev:latest';
const HEALTH_URL = 'http://localhost:2020/healthz';

const isDockerAvailable = (): boolean => {
  try {
    execSync('docker --version', { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
};

const isDockerRunning = (): boolean => {
  try {
    execSync('docker info', { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
};

const isTwentyServerRunning = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(HEALTH_URL, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const body = await response.json();

    return body.status === 'ok';
  } catch {
    return false;
  }
};

const isContainerRunning = (): boolean => {
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

const waitForHealthy = async (
  timeoutSeconds: number = 120,
): Promise<boolean> => {
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;

  while (Date.now() - startTime < timeoutMs) {
    if (await isTwentyServerRunning()) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return false;
};

const getActiveWorkspaceId = (): string | null => {
  try {
    const result = execSync(
      `docker exec ${CONTAINER_NAME} su-exec postgres psql -h localhost -U twenty -d default -t -c "SELECT id FROM core.workspace WHERE \\"activationStatus\\" = 'ACTIVE' LIMIT 1"`,
      { encoding: 'utf-8' },
    ).trim();

    return result || null;
  } catch {
    return null;
  }
};

const generateApiKeyToken = (workspaceId: string): string | null => {
  try {
    const output = execSync(
      `docker exec ${CONTAINER_NAME} node /app/scripts/generate-api-key.js ${workspaceId}`,
      { encoding: 'utf-8' },
    );

    const TOKEN_PREFIX = 'TOKEN:';
    const tokenLine = output
      .trim()
      .split('\n')
      .find((line) => line.includes(TOKEN_PREFIX));

    if (!tokenLine) {
      return null;
    }

    const tokenStartIndex =
      tokenLine.indexOf(TOKEN_PREFIX) + TOKEN_PREFIX.length;

    return tokenLine.slice(tokenStartIndex).trim();
  } catch {
    return null;
  }
};

export type LocalInstanceResult = {
  running: boolean;
  apiKey?: string;
};

export const setupLocalInstance = async (): Promise<LocalInstanceResult> => {
  console.log('');
  console.log(chalk.blue('🐳 Setting up local Twenty instance...'));

  if (await isTwentyServerRunning()) {
    console.log(
      chalk.green('✅ Twenty server is already running on localhost:2020.'),
    );
  } else {
    if (!isDockerAvailable()) {
      console.log(
        chalk.yellow(
          '⚠️  Docker is not installed. Please install Docker first.',
        ),
      );
      console.log(chalk.gray('   See https://docs.docker.com/get-docker/'));

      return { running: false };
    }

    if (!isDockerRunning()) {
      console.log(
        chalk.yellow(
          '⚠️  Docker is not running. Please start Docker and try again.',
        ),
      );

      return { running: false };
    }

    // Start or restart the container
    if (isContainerRunning()) {
      console.log(
        chalk.gray('Container exists but server not healthy, restarting...'),
      );
      execSync(`docker restart ${CONTAINER_NAME}`, { stdio: 'ignore' });
    } else {
      // Remove stopped container if it exists
      spawnSync('docker', ['rm', '-f', CONTAINER_NAME], { stdio: 'ignore' });

      console.log(chalk.gray(`Pulling ${IMAGE}...`));

      try {
        execSync(`docker pull ${IMAGE}`, { stdio: 'inherit' });
      } catch {
        console.log(
          chalk.gray(
            'Pull failed (image may not be published yet), trying local image...',
          ),
        );
      }

      console.log(chalk.gray('Starting Twenty container...'));

      try {
        execSync(
          [
            'docker run -d',
            `--name ${CONTAINER_NAME}`,
            '-p 2020:3000',
            '-v twenty-dev-data:/data/postgres',
            '-v twenty-dev-storage:/app/.local-storage',
            IMAGE,
          ].join(' '),
          { stdio: 'inherit' },
        );
      } catch {
        console.log(
          chalk.yellow(
            '⚠️  Failed to start Twenty container. Check Docker logs.',
          ),
        );

        return { running: false };
      }
    }

    console.log(
      chalk.gray(
        'Waiting for Twenty to be ready (first start takes ~90s for migrations)...',
      ),
    );

    const healthy = await waitForHealthy(180);

    if (!healthy) {
      console.log(
        chalk.yellow(
          '⚠️  Twenty server did not become healthy in time. Check: docker logs twenty-dev-server',
        ),
      );

      return { running: false };
    }

    console.log(chalk.green('✅ Twenty server is running on localhost:2020.'));
  }

  console.log('');
  console.log(
    chalk.blue(
      '👉 Please create your workspace at http://localhost:2020 before continuing.',
    ),
  );

  const { workspaceCreated } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'workspaceCreated',
      message: 'Have you finished creating your workspace?',
      default: true,
    },
  ]);

  if (!workspaceCreated) {
    console.log(
      chalk.yellow(
        '⚠️  Skipping API key generation. Run `yarn twenty remote add --local` manually after creating your workspace.',
      ),
    );

    return { running: true };
  }

  console.log(chalk.blue('🔑 Generating API key for your workspace...'));

  const workspaceId = getActiveWorkspaceId();

  if (!isDefined(workspaceId)) {
    console.log(
      chalk.yellow(
        '⚠️  No active workspace found. Make sure you completed the signup flow, then run `yarn twenty remote add --local` manually.',
      ),
    );

    return { running: true };
  }

  const apiKey = generateApiKeyToken(workspaceId);

  if (!isDefined(apiKey)) {
    console.log(
      chalk.yellow(
        '⚠️  Could not generate API key. Run `yarn twenty remote add --local` manually.',
      ),
    );

    return { running: true };
  }

  console.log(chalk.green('✅ API key generated for your workspace.'));

  return { running: true, apiKey };
};
