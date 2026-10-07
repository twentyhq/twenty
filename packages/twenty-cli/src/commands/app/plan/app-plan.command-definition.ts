import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_PLAN_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'plan'],
  description:
    'Build the app and preview metadata changes without applying them',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
    {
      flags: '--no-delete',
      description: 'Keep remote entities missing from the app source',
    },
  ],
  examples: [
    'twenty app plan --remote dev',
    'twenty app plan --path ./apps/billing --no-delete --json',
  ],
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: true,
  needsTarget: true,
  requiredPermissions: ['APPLICATIONS'],
  load: async () =>
    (await import('@/commands/app/plan/run-app-plan-command'))
      .runAppPlanCommand,
};
