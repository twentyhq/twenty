import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_EXEC_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'exec'],
  description: 'Execute a deployed app logic function as the signed-in user',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
    { flags: '--name <name>', description: 'Exact deployed function name' },
    {
      flags: '--universal-identifier <id>',
      description: 'Function universal identifier',
    },
    {
      flags: '--post-install',
      description: 'Execute the post-install hook without installing the app',
    },
    {
      flags: '--pre-install',
      description: 'Execute the pre-install hook without installing the app',
    },
    {
      flags: '--uninstall-hook',
      description: 'Execute the uninstall hook without uninstalling the app',
    },
    {
      flags: '--payload <json>',
      description: 'JSON object, @file or - for stdin (default: {})',
    },
  ],
  examples: [
    'twenty app exec --name add-numbers --remote dev',
    'twenty app exec --name add-numbers --payload @payload.json --json',
    "twenty app exec --post-install --payload '{}'",
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: true,
  needsTarget: true,
  requiredPermissions: ['APPLICATIONS', 'WORKFLOWS'],
  load: async () =>
    (await import('@/commands/app/exec/run-app-exec-command'))
      .runAppExecCommand,
};
