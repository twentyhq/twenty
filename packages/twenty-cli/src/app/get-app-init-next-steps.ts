import { isDefined } from 'twenty-shared/utils';

import { type AppInitNextStep } from '@/app/types/app-init-next-step.type';

const SHELL_SAFE_PATTERN = /^[\w./-]+$/;

const quoteForShell = (value: string) => {
  if (SHELL_SAFE_PATTERN.test(value)) return value;
  if (process.platform === 'win32') return `'${value.replace(/'/g, "''")}'`;

  return `'${value.replace(/'/g, `'\\''`)}'`;
};

export const getAppInitNextSteps = ({
  displayPath,
  isTargetConfigured,
  remoteName,
}: {
  displayPath: string;
  isTargetConfigured: boolean;
  remoteName: string | undefined;
}): AppInitNextStep[] => {
  const remoteFlag = isDefined(remoteName)
    ? ` --remote ${quoteForShell(remoteName)}`
    : '';

  return [
    ...(displayPath === '.'
      ? []
      : [
          {
            command: `cd ${quoteForShell(displayPath.startsWith('-') ? `./${displayPath}` : displayPath)}`,
            description: 'Enter the new app',
          },
        ]),
    { command: 'yarn install', description: 'Install the pinned dependencies' },
    ...(isTargetConfigured
      ? []
      : [
          {
            command: `twenty auth login --url <url> --name ${isDefined(remoteName) ? quoteForShell(remoteName) : '<name>'}`,
            description: 'Connect a workspace',
          },
        ]),
    {
      command: `twenty app apply --create${remoteFlag}`,
      description: 'Build the app and install it in your workspace',
    },
  ].map((step) => ({
    ...step,
    description:
      process.platform === 'win32'
        ? `${step.description} (PowerShell)`
        : step.description,
  }));
};
