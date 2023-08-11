import prompts, { PromptObject } from 'prompts';
import { spawn } from 'child_process';
import { execShell, REPO_URL } from '../../../config.js';
import { join } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import pkg from 'pg';
const { Client } = pkg;

export const noDockerQuestion1: PromptObject<string>[] = [
  {
    type: 'text',
    name: 'folder_name',
    initial: 'twenty',
    message: 'Name of folder where we will clone the repo?',
  },
];

export const noDockerQuestion2: PromptObject<string>[] = [
  {
    type: 'text',
    name: 'postgres_string',
    initial: 'postgres://twenty:twenty@postgres:5432/default',
    message:
      'Since you are not using Docker, you need to bring your own database, please enter your postgres connection string.',
  },
];

export const askNoDockerQuestions: () => Promise<void> = async () => {
  let folderResponse = await prompts(noDockerQuestion1);

  let folderExists = fs.existsSync(folderResponse.folder_name);
  while (folderExists) {
    try {
      folderResponse = await prompts({
        type: 'text',
        name: 'folder_name',
        message:
          'Folder already exists. Please choose another name and press enter.',
      });
    } catch (error) {
      if ((error as NodeJS.Signals) === 'SIGINT') {
        process.exit(0);
      } else {
        throw error;
      }
    }
    folderExists = fs.existsSync(folderResponse.folder_name);
  }

  let connectionStringResponse = await prompts(noDockerQuestion2);

  let postgres_connection_valid = false;
  while (!postgres_connection_valid) {
    const client = new Client({
      connectionString: connectionStringResponse.postgres_string,
    });
    try {
      await client.connect();
      await client.end();
      postgres_connection_valid = true;
    } catch (error) {
      console.log(error);
      postgres_connection_valid = false;
    }
    if (!postgres_connection_valid) {
      try {
        connectionStringResponse = await prompts({
          type: 'text',
          name: 'postgres_string',
          initial: 'postgres://twenty:twenty@postgres:5432/default',
          message:
            'Connection to Postgres failed. Please enter the string again',
        });
      } catch (error) {
        if ((error as NodeJS.Signals) === 'SIGINT') {
          process.exit(0);
        } else {
          throw error;
        }
      }
    }
  }

  let git_is_installed = false;
  while (!git_is_installed) {
    try {
      await execShell('git --version');
      git_is_installed = true;
    } catch (error) {
      try {
        await prompts({
          type: 'text',
          name: 'git_install',
          message:
            'Git does not appear to be installed. Please install it and restart.',
        });
      } catch (error) {
        if ((error as NodeJS.Signals) === 'SIGINT') {
          process.exit(0);
        } else {
          throw error;
        }
      }
    }
  }

  let npm_is_installed = false;
  while (!npm_is_installed) {
    try {
      await execShell('npm --version');
      npm_is_installed = true;
    } catch (error) {
      try {
        await prompts({
          type: 'text',
          name: 'git_install',
          message:
            'Npm does not appear to be installed. Please install it and press enter.',
        });
      } catch (error) {
        if ((error as NodeJS.Signals) === 'SIGINT') {
          process.exit(0);
        } else {
          throw error;
        }
      }
    }
  }

  console.log('Cloning the Twenty repo. This can take a little while.');

  await execShell(`git clone ${REPO_URL} ${folderResponse.folder_name}`);

  await execShell(
    `cp ${folderResponse.folder_name}/front/.env.example  ${folderResponse.folder_name}/front/.env`,
  );
  await execShell(
    `cp ${folderResponse.folder_name}/server/.env.example  ${folderResponse.folder_name}/server/.env`,
  );

  const envFile = path.resolve(
    join(folderResponse.folder_name, 'server', '.env'),
  );
  let envFileLines = fs.readFileSync(envFile, 'utf-8').split('\n');
  envFileLines = envFileLines.map((line) =>
    line.startsWith('PG_DATABASE_URL=')
      ? `PG_DATABASE_URL=${connectionStringResponse.postgres_string}`
      : line,
  );
  // write the updated content back to the .env file
  fs.writeFileSync(envFile, envFileLines.join('\n'));

  console.log('Building the frontend (running npm install on frontend folder)');
  const buildFront = spawn('npm', ['install'], {
    cwd: join(folderResponse.folder_name, 'front'),
  });
  buildFront.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  buildFront.stderr.on('data', (data) => {
    console.log(`${data}`);
  });
  buildFront.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });
  buildFront.on('close', () => {
    console.log('Building the server (running npm install on server folder)');
    const buildServer = spawn('npm', ['install'], {
      cwd: join(folderResponse.folder_name, 'server'),
    });
    buildServer.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
    buildServer.stderr.on('data', (data) => {
      console.log(`${data}`);
    });
    buildServer.on('error', (error) => {
      console.log(`error: ${error.message}`);
    });
    buildServer.on('close', () => {
      console.log(
        'Running the frontend (running npm start on frontend folder)',
      );
      const runFrontend = spawn('npm', ['run', 'start'], {
        cwd: join(folderResponse.folder_name, 'server'),
      });
      runFrontend.stdout.on('data', (data) => {
        console.log(`${data}`);
      });
      runFrontend.stderr.on('data', (data) => {
        console.log(`${data}`);
      });
      runFrontend.on('error', (error) => {
        console.log(`error: ${error.message}`);
      });

      console.log('Running the server (running npm start on server folder)');
      const runServer = spawn('npm', ['run', 'start'], {
        cwd: join(folderResponse.folder_name, 'server'),
      });
      runServer.stdout.on('data', (data) => {
        console.log(`${data}`);
      });
      runServer.stderr.on('data', (data) => {
        console.log(`${data}`);
      });
      runServer.on('error', (error) => {
        console.log(`error: ${error.message}`);
      });
    });
  });
};
