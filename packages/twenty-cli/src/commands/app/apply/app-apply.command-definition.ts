import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_APPLY_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'apply'],
  description:
    'Build the app, preview the changes, then upload and sync it to the workspace',
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
        'Register the app and install it in the workspace if it has no registration yet',
    },
    {
      flags: '--yes',
      description:
        'Apply object and field deletions without asking; does not change which entities are deleted',
    },
  ],
  examples: [
    'twenty app apply --remote dev',
    'twenty app apply --create --json',
    'twenty app apply --no-prune',
    'twenty app apply --prune',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: true,
  needsTarget: true,
  requiredPermissions: ['APPLICATIONS', 'UPLOAD_FILE'],
  load: async () =>
    (await import('@/commands/app/apply/run-app-apply-command'))
      .runAppApplyCommand,
};
