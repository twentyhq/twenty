import prompts, { PromptObject } from 'prompts';
import { spawn } from 'child_process';
import { execShell, REPO_URL } from '../../../config.js';
import { join } from 'path';
import * as fs from 'fs';

export const dockerQuestions: PromptObject<string>[] = [
  {
    type: 'text',
    name: 'folder_name',
    initial: 'twenty',
    message: 'Name of folder where we will clone the repo?',
  },
];

export const askDockerQuestions: () => Promise<void> = async () => {
  let folderResponse = await prompts(dockerQuestions);

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
            'Git does not appear to be installed. Please install it and press enter.',
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

  let docker_is_installed = false;
  while (!docker_is_installed) {
    try {
      await execShell('docker --version');
      docker_is_installed = true;
    } catch (error) {
      try {
        await prompts({
          type: 'text',
          name: 'docker_install',
          message:
            'Docker does not appear to be installed. Please install it and press enter.',
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

  let docker_daemon_running = false;
  while (!docker_daemon_running) {
    try {
      await execShell('docker info');
      docker_daemon_running = true;
    } catch (error) {
      try {
        await prompts({
          type: 'text',
          name: 'docker_install',
          message:
            'Docker daemon does not appear to be running. Please start it manually and press enter.',
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

  console.log('Build the docker images. (cd infra/dev then make build)');

  const makeBuild = spawn('make', ['build'], {
    cwd: join(folderResponse.folder_name, 'infra', 'dev'),
  });
  makeBuild.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  makeBuild.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  makeBuild.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });
  makeBuild.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};
