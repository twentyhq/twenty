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
        'Application to pull when this project has no application definition',
    },
    { flags: '--verbose', description: 'List coverage details' },
  ],
  examples: [
    'twenty app pull --remote dev',
    'twenty app pull --path ./apps/billing --json',
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
