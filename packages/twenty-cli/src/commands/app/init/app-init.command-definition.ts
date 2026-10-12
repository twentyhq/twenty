import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_INIT_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['app', 'init'],
  description:
    'Create an app from the template bundled with this CLI, without installing anything',
  arguments: [
    {
      name: 'name',
      description: 'Package name of the app, for example my-app',
      required: true,
    },
  ],
  options: [
    {
      flags: '--path <directory>',
      description: 'Directory to create (default: ./<name>)',
    },
    {
      flags: '--display-name <name>',
      description:
        'Name shown in Twenty (default: derived from the package name)',
    },
    {
      flags: '--description <text>',
      description: 'Description shown in Twenty',
    },
  ],
  examples: [
    'twenty app init my-app',
    'twenty app init billing --path ./apps/billing --display-name Billing --json',
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/app/init/run-app-init-command'))
      .runAppInitCommand,
};
