import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_INSTALL_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'install'],
  description: 'Install a registered app package in the target workspace',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
    {
      flags: '--universal-identifier <id>',
      description:
        'Registered app universal identifier, works without a local project',
    },
  ],
  examples: [
    'twenty app install --remote dev',
    'twenty app install --path ./apps/billing --json',
    'twenty app install --universal-identifier <id> --remote staging --json',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: true,
  needsTarget: true,
  requiredPermissions: ['APPLICATIONS'],
  load: async () =>
    (await import('@/commands/app/install/run-app-install-command'))
      .runAppInstallCommand,
};
