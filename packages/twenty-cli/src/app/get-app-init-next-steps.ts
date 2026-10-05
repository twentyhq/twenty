import { isDefined } from 'twenty-shared/utils';

import { type AppInitNextStep } from '@/app/types/app-init-next-step.type';

const SHELL_SAFE_PATTERN = /^[\w./-]+$/;

const quoteForShell = (value: string) =>
  SHELL_SAFE_PATTERN.test(value) ? value : `'${value.replace(/'/g, `'\\''`)}'`;

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
            command: `cd ${quoteForShell(displayPath)}`,
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
  ];
};
