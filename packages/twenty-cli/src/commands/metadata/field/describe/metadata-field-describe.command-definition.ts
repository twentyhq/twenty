import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const METADATA_FIELD_DESCRIBE_COMMAND_DEFINITION: TargetCommandDefinition =
  {
    path: ['metadata', 'field', 'describe'],
    description: 'Describe a field, its constraints, options and relations',
    arguments: [
      {
        name: 'object',
        description: 'Exact singular or plural object API name',
        required: true,
      },
      {
        name: 'field',
        description: 'Exact field API name, including system fields',
        required: true,
      },
    ],
    examples: [
      'twenty metadata field describe companies tier',
      'twenty metadata field describe people company --json',
    ],
    outputModes: ['human', 'json'],
    writes: false,
    needsProject: false,
    needsTarget: true,
    load: async () =>
      (
        await import('@/commands/metadata/field/describe/run-metadata-field-describe-command')
      ).runMetadataFieldDescribeCommand,
  };
