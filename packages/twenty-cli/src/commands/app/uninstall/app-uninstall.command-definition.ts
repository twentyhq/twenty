import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_UNINSTALL_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'uninstall'],
  description:
    'Uninstall the app from the workspace, deleting its objects, fields and their data',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
    {
      flags: '--universal-identifier <id>',
      description:
        'Uninstall the app with this universal identifier without building the project, for example when the build is broken',
    },
    {
      flags: '--yes',
      description: 'Uninstall without asking',
    },
  ],
  examples: [
    'twenty app uninstall --remote dev',
    'twenty app uninstall --yes --json',
    'twenty app uninstall --universal-identifier <id> --yes',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: true,
  needsTarget: true,
  requiredPermissions: ['APPLICATIONS'],
  load: async () =>
    (await import('@/commands/app/uninstall/run-app-uninstall-command'))
      .runAppUninstallCommand,
};
