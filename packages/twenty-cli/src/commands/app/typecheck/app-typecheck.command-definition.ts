import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_TYPECHECK_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['app', 'typecheck'],
  description:
    'Typecheck the app with its project TypeScript, without building',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
  ],
  examples: ['twenty app typecheck', 'twenty app typecheck --json'],
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: true,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/app/typecheck/run-app-typecheck-command'))
      .runAppTypecheckCommand,
};
