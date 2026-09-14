import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Raised as "All versions satisfying <range> are quarantined", or for a tag as
// "The version for tag <tag> is quarantined", when every candidate version is
// younger than the configured npmMinimalAgeGate.
const YARN_QUARANTINE_ERROR_CODE = 'YN0016';

const QUARANTINED_PACKAGE_PATTERN =
  /(@?[\w.-]+(?:\/[\w.-]+)?)@npm:(\S+?): (?:All versions satisfying|The version for tag)/g;

const ANSI_ESCAPE_PATTERN = /\x1b\[[0-9;]*m/g;

// A selector Yarn can test against a version works as a preapproval entry; a
// dist-tag does not, and only the bare package name will waive it.
const VERSION_SELECTOR_PATTERN = /^[\^~>=<\s]*\d/;

const OUTPUT_TAIL_LINES = 20;

const tail = (output: string) =>
  output.trim().split('\n').slice(-OUTPUT_TAIL_LINES).join('\n');

const parseQuarantinedPackages = (output: string) => {
  const matches = output
    .replace(ANSI_ESCAPE_PATTERN, '')
    .matchAll(QUARANTINED_PACKAGE_PATTERN);

  return [
    ...new Set(
      [...matches].map(([, packageName, selector]) =>
        VERSION_SELECTOR_PATTERN.test(selector)
          ? `${packageName}@${selector}`
          : packageName,
      ),
    ),
  ];
};

const buildQuarantineMessage = ({
  appDirectory,
  quarantinedPackages,
}: {
  appDirectory: string;
  quarantinedPackages: string[];
}) =>
  [
    'Dependency installation failed: your package manager enforces a minimum',
    'release age, and these packages were published too recently to satisfy it:',
    '',
    ...quarantinedPackages.map((descriptor) => `  ${descriptor}`),
    '',
    `Your project was created at ${appDirectory} and does not need to be scaffolded again.`,
    'You can either wait until those packages are older than your configured gate',
    'and run `yarn install` there, or waive the gate for just them by adding to',
    "that project's .yarnrc.yml:",
    '',
    '  npmPreapprovedPackages:',
    // Quoted because a scoped descriptor starts with "@", which YAML reserves:
    // an unquoted `- @scope/pkg@^1.2.3` is a parse error, not a value.
    ...quarantinedPackages.map((descriptor) => `    - "${descriptor}"`),
    '',
    'That leaves the gate in force for every other dependency.',
  ].join('\n');

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
    const quarantinedPackages = output.includes(YARN_QUARANTINE_ERROR_CODE)
      ? parseQuarantinedPackages(output)
      : [];

    // Continuing here would authenticate, sync and report success over a project
    // that has no node_modules, so surface the failure instead.
    throw new Error(
      quarantinedPackages.length > 0
        ? buildQuarantineMessage({
            appDirectory: root,
            quarantinedPackages,
          })
        : [
            `Dependency installation failed in ${root}:`,
            '',
            tail(output),
            '',
            // The project itself is intact: package.json carries its real name and
            // the lockfile is the shipped one, which a plain install reconciles.
            'The project was created. Fix the problem above and run `yarn install` there.',
          ].join('\n'),
    );
  }
};
