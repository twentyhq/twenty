import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const DATA_GET_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['data', 'get'],
  description: 'Inspect a record by id',
  arguments: [
    {
      name: 'object',
      description: 'Exact singular or plural API name',
      required: true,
    },
    { name: 'id', description: 'Record id', required: true },
  ],
  examples: [
    'twenty data get companies <id>',
    'twenty data get people <id> --json',
  ],
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: false,
  needsTarget: true,
  load: async () =>
    (await import('@/commands/data/get/run-data-get-command'))
      .runDataGetCommand,
};
