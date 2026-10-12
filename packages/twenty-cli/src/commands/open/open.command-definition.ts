import { HELP_GROUP } from '@/catalog/constants/help-group.constant';
import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const OPEN_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['open'],
  description: 'Open the workspace in your browser',
  helpGroup: HELP_GROUP.WORKSPACE,
  arguments: [
    {
      name: 'page',
      description: 'Page to open, for example settings/applications',
      required: false,
    },
  ],
  options: [
    {
      flags: '--url-only',
      description: 'Print the address instead of opening a browser',
    },
  ],
  examples: [
    'twenty open',
    'twenty open settings/applications',
    'twenty open --remote staging --url-only --json',
  ],
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: false,
  needsTarget: true,
  load: async () =>
    (await import('@/commands/open/run-open-command')).runOpenCommand,
};
