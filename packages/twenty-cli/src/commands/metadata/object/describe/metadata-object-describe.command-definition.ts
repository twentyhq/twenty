import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const METADATA_OBJECT_DESCRIBE_COMMAND_DEFINITION: TargetCommandDefinition =
  {
    path: ['metadata', 'object', 'describe'],
    description: 'Describe an object',
    arguments: [
      {
        name: 'object',
        description: 'Exact singular or plural API name',
        required: true,
      },
    ],
    examples: [
      'twenty metadata object describe companies',
      'twenty metadata object describe person --json',
    ],
    outputModes: ['human', 'json'],
    writes: false,
    needsProject: false,
    needsTarget: true,
    load: async () =>
      (
        await import('@/commands/metadata/object/describe/run-metadata-object-describe-command')
      ).runMetadataObjectDescribeCommand,
  };
