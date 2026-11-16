import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const DATA_EXPORT_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['data', 'export'],
  description: 'Export records to a CSV file with server-side permissions',
  arguments: [
    {
      name: 'object',
      description: 'Exact singular or plural API name',
      required: true,
    },
  ],
  options: [
    {
      flags: '--output <file>',
      description: 'Destination CSV file (required)',
    },
    {
      flags: '--fields <names>',
      description:
        'Comma-separated field API names, in CSV order (default: active non-system fields)',
    },
    {
      flags: '--filter <expression>',
      description: 'REST filter expression, as in data list',
    },
    {
      flags: '--order-by <expression>',
      description: 'REST order_by expression, as in data list',
    },
    {
      flags: '--force',
      description:
        'Replace an existing output file after a successful download',
    },
  ],
  examples: [
    'twenty data export companies --output companies.csv',
    "twenty data export companies --fields name,domainName,employees --filter 'employees[gte]:5000' --output large-companies.csv",
    'twenty data export people --output people.csv --format ndjson',
  ],
  outputModes: ['human', 'json', 'ndjson'],
  writes: true,
  needsProject: false,
  needsTarget: true,
  requiredPermissions: ['EXPORT_CSV'],
  load: async () =>
    (await import('@/commands/data/export/run-data-export-command'))
      .runDataExportCommand,
};
