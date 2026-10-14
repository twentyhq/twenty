import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_GENERATE_CLIENT_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'generate-client'],
  description:
    "Regenerate the app's typed API client from the workspace schema, without building or syncing",
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
  ],
  examples: [
    'twenty app generate-client --remote dev',
    'twenty app generate-client --path ./apps/billing --json',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: true,
  needsTarget: true,
  load: async () =>
    (
      await import('@/commands/app/generate-client/run-app-generate-client-command')
    ).runAppGenerateClientCommand,
};
