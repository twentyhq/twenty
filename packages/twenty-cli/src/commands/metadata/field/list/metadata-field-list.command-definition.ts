import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const METADATA_FIELD_LIST_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['metadata', 'field', 'list'],
  description: 'List fields and who owns each one',
  arguments: [
    {
      name: 'object',
      description: 'Exact singular or plural API name',
      required: true,
    },
  ],
  options: [{ flags: '--all', description: 'Include system fields' }],
  examples: [
    'twenty metadata field list companies',
    'twenty metadata field list companies --all --json',
  ],
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: false,
  needsTarget: true,
  load: async () =>
    (
      await import('@/commands/metadata/field/list/run-metadata-field-list-command')
    ).runMetadataFieldListCommand,
};
