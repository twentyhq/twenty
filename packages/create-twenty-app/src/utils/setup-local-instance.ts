import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'node:child_process';
import { isDefined } from 'twenty-shared/utils';

const INSTALL_SCRIPT_URL =
  'https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-docker/scripts/install.sh';

const SERVER_CONTAINER = 'twenty-server-1';
const DB_CONTAINER = 'twenty-db-1';

const isDockerAvailable = (): boolean => {
  try {
    execSync('docker compose version', { stdio: 'ignore' });

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

    const response = await fetch('http://localhost:3000/healthz', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const body = await response.json();

    return body.status === 'ok';
  } catch {
    return false;
  }
};

const getActiveWorkspaceId = (): string | null => {
  try {
    const result = execSync(
      `docker exec ${DB_CONTAINER} psql -U postgres -d default -t -c "SELECT id FROM core.workspace WHERE \\"activationStatus\\" = 'ACTIVE' LIMIT 1"`,
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
      `docker exec -e NODE_ENV=development ${SERVER_CONTAINER} yarn command:prod workspace:generate-api-key -w ${workspaceId}`,
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
      chalk.green('✅ Twenty server is already running on localhost:3000.'),
    );
  } else {
    if (!isDockerAvailable()) {
      console.log(
        chalk.yellow(
          '⚠️  Docker Compose is not installed. Please install Docker first.',
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

    try {
      execSync(`bash <(curl -sL ${INSTALL_SCRIPT_URL})`, {
        stdio: 'inherit',
        shell: '/bin/bash',
      });
    } catch {
      console.log(
        chalk.yellow('⚠️  Local instance setup did not complete successfully.'),
      );

      return { running: false };
    }
  }

  console.log('');
  console.log(
    chalk.blue(
      '👉 Please create your workspace in the browser before continuing.',
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
        '⚠️  No active workspace found. Make sure you completed the signup flow, then run `yarn twenty auth:login` manually.',
      ),
    );

    return { running: true };
  }

  const apiKey = generateApiKeyToken(workspaceId);

  if (!isDefined(apiKey)) {
    console.log(
      chalk.yellow(
        '⚠️  Could not generate API key. Run `yarn twenty auth:login` manually.',
      ),
    );

    return { running: true };
  }

  console.log(chalk.green('✅ API key generated for your workspace.'));

  return { running: true, apiKey };
};
