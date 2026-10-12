import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const METADATA_OBJECT_LIST_COMMAND_DEFINITION: TargetCommandDefinition =
  {
    path: ['metadata', 'object', 'list'],
    description: 'List objects and who owns each one',
    options: [
      {
        flags: '--all',
        description: 'Include system objects',
      },
    ],
    examples: [
      'twenty metadata object list',
      'twenty metadata object list --all --json',
    ],
    outputModes: ['human', 'json'],
    writes: false,
    needsProject: false,
    needsTarget: true,
    load: async () =>
      (
        await import('@/commands/metadata/object/list/run-metadata-object-list-command')
      ).runMetadataObjectListCommand,
  };
