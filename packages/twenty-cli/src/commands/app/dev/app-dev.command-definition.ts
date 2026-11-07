import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_DEV_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'dev'],
  description:
    'Watch app source, build complete snapshots and sync changes to the workspace',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
    {
      flags: '--prune',
      description:
        'Delete remote entities missing from the app source (the default, except for the workspace custom application)',
    },
    {
      flags: '--no-prune',
      description: 'Keep remote entities missing from the app source',
    },
    {
      flags: '--no-delete',
      description: 'Deprecated alias of --no-prune',
      hidden: true,
    },
    {
      flags: '--create',
      description:
        'Allow registering and installing an app with no registration',
    },
    {
      flags: '--yes',
      description: 'Allow object and field deletions without asking',
    },
  ],
  examples: [
    'twenty app dev --remote dev',
    'twenty app dev --create --no-prune',
    'twenty app dev --format ndjson --no-prune',
  ],
  outputModes: ['human', 'ndjson'],
  writes: true,
  needsProject: true,
  needsTarget: true,
  requiredPermissions: ['APPLICATIONS', 'UPLOAD_FILE'],
  load: async () =>
    (await import('@/commands/app/dev/run-app-dev-command')).runAppDevCommand,
};
