import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

import { TEMPLATE_FIRST_PARTY_PACKAGES } from '@/constants/template-packages';
import createTwentyAppPackageJson from 'package.json';

const execPromise = promisify(exec);

// Raised as "All versions satisfying <range> are quarantined" when every
// candidate version is younger than the configured npmMinimalAgeGate.
const YARN_QUARANTINE_ERROR_CODE = 'YN0016';

const OUTPUT_TAIL_LINES = 20;

const tail = (output: string) =>
  output.trim().split('\n').slice(-OUTPUT_TAIL_LINES).join('\n');

const buildQuarantineMessage = (appDirectory: string) => {
  const preapproved = TEMPLATE_FIRST_PARTY_PACKAGES.map(
    (packageName) =>
      `    - ${packageName}@${createTwentyAppPackageJson.version}`,
  ).join('\n');

  return [
    'Dependency installation failed: your package manager enforces a minimum',
    'release age, and these packages were published too recently to satisfy it.',
    '',
    `Your project was created at ${appDirectory} and does not need to be scaffolded again.`,
    'You can either wait until the packages are older than your configured gate and',
    'run `yarn install` there, or waive the gate for just these packages by adding',
    "to that project's .yarnrc.yml:",
    '',
    '  npmPreapprovedPackages:',
    preapproved,
    '',
    'That leaves the gate in force for every other dependency.',
  ].join('\n');
};

export const install = async (
  root: string,
  onProgress?: (message: string) => void,
) => {
  onProgress?.('Enabling corepack');
  try {
    await execPromise('corepack enable', { cwd: root });
  } catch (error: any) {
    console.warn(chalk.yellow('corepack enable failed:'), error.stderr);
  }

  onProgress?.('Running yarn install');
  try {
    // Yarn installs immutably by default when CI is set, but this install is what
    // finalises the template's lockfile: it rewrites the workspace root entry to
    // the project's real name. Immutable mode rejects that with YN0028.
    await execPromise('yarn install --no-immutable', { cwd: root });
  } catch (error: any) {
    const output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`;

    // Continuing here would authenticate, sync and report success over a project
    // that has no node_modules, so surface the failure instead.
    throw new Error(
      output.includes(YARN_QUARANTINE_ERROR_CODE)
        ? buildQuarantineMessage(root)
        : `Dependency installation failed in ${root}:\n\n${tail(output)}`,
    );
  }
};
