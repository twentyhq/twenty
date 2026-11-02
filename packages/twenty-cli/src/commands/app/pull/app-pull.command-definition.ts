import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_PULL_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'pull'],
  description:
    'Pull an app, or create a local project for the workspace custom app',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory, or a new or empty directory for the workspace custom app',
    },
    {
      flags: '--yes',
      description:
        'Create a missing project and install its dependencies without prompting',
    },
    { flags: '--verbose', description: 'List coverage details' },
  ],
  examples: [
    'twenty app pull --remote dev',
    'twenty app pull --path ./apps/billing',
    'twenty app pull --path ./workspace-app --yes --json',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: true,
  requiredPermissions: ['APPLICATIONS'],
  load: async () =>
    (await import('@/commands/app/pull/run-app-pull-command'))
      .runAppPullCommand,
};
