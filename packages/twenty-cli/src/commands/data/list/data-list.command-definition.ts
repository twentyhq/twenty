import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const DATA_LIST_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['data', 'list'],
  description: 'List records with REST filters and pagination',
  arguments: [
    {
      name: 'object',
      description: 'Exact singular or plural API name',
      required: true,
    },
  ],
  options: [
    {
      flags: '--filter <expression>',
      description: 'REST filter expression, passed through unchanged',
    },
    {
      flags: '--order-by <expression>',
      description: 'REST order_by expression, passed through unchanged',
    },
    {
      flags: '--fields <names>',
      description:
        'Comma-separated human table columns; JSON and NDJSON retain full records',
    },
    {
      flags: '--limit <count>',
      description: 'Records per page, 1–200 (default: 50)',
    },
    {
      flags: '--cursor <cursor>',
      description: 'Start after this opaque REST cursor',
    },
    {
      flags: '--all',
      description:
        'Read every remaining page, bounded unless --format ndjson is used',
    },
  ],
  examples: [
    'twenty data list companies --limit 20',
    "twenty data list companies --filter 'employees[gte]:5000' --order-by 'employees[DescNullsLast]'",
    'twenty data list people --all --format ndjson',
  ],
  outputModes: ['human', 'json', 'ndjson'],
  writes: false,
  needsProject: false,
  needsTarget: true,
  load: async () =>
    (await import('@/commands/data/list/run-data-list-command'))
      .runDataListCommand,
};
