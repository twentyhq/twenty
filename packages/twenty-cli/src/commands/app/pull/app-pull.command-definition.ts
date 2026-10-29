import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_PULL_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'pull'],
  description: 'Pull workspace metadata into an existing app project',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
    {
      flags: '--universal-identifier <uuid>',
      description:
        'Application to pull (default: the workspace custom application)',
    },
    { flags: '--verbose', description: 'List coverage details' },
  ],
  examples: [
    'twenty app pull --remote dev',
    'twenty app pull --path ./workspace-app --json',
    'twenty app pull --universal-identifier <uuid> --path ./apps/billing',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: true,
  needsTarget: true,
  requiredPermissions: ['APPLICATIONS'],
  load: async () =>
    (await import('@/commands/app/pull/run-app-pull-command'))
      .runAppPullCommand,
};
