import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import { preserveLegacyRecordAccess } from 'src/database/commands/upgrade-version-command/2-43/utils/preserve-legacy-record-access.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const buildObjects = (threadReadability: MetadataReadability) =>
  [
    {
      id: 'thread',
      universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      nameSingular: 'agentChatThread',
      isCustom: false,
      readability: threadReadability,
    },
    {
      id: 'private',
      universalIdentifier: 'private',
      nameSingular: 'privateRecord',
      isCustom: true,
      readability: MetadataReadability.PRIVATE,
    },
    {
      id: 'inherited',
      universalIdentifier: 'inherited',
      nameSingular: 'inheritedRecord',
      isCustom: true,
      readability: MetadataReadability.INHERITED,
    },
    {
      id: 'application',
      universalIdentifier: 'application',
      nameSingular: 'applicationRecord',
      isCustom: true,
      readability: MetadataReadability.APPLICATION,
    },
  ] as FlatObjectMetadata[];

describe('legacy record access compatibility', () => {
  it.each([
    {
      wasRecordSharingEnabled: false,
      markerCreated: true,
      threadReadability: MetadataReadability.SYSTEM,
      expectedObjectIds: ['private', 'inherited'],
    },
    {
      wasRecordSharingEnabled: true,
      markerCreated: true,
      threadReadability: MetadataReadability.SYSTEM,
      expectedObjectIds: [],
    },
    {
      wasRecordSharingEnabled: false,
      markerCreated: false,
      threadReadability: MetadataReadability.SYSTEM,
      expectedObjectIds: [],
    },
    {
      wasRecordSharingEnabled: false,
      markerCreated: true,
      threadReadability: MetadataReadability.PRIVATE,
      expectedObjectIds: [],
    },
  ])(
    'preserves access only for eligible historical rows: %j',
    async ({
      wasRecordSharingEnabled,
      markerCreated,
      threadReadability,
      expectedObjectIds,
    }) => {
      const grantedObjectIds: string[] = [];
      const manager = {
        query: jest.fn(async (_sql: string, parameters: string[]) => {
          if (parameters[0] === 'COMMON_RECORD_SHARING_LEGACY_ACCESS_MIGRATED')
            return markerCreated ? [{ id: 'marker' }] : [];
          grantedObjectIds.push(parameters[0]);
          return [];
        }),
      };
      await preserveLegacyRecordAccess({
        manager: manager as never,
        workspaceId: WORKSPACE_ID,
        objects: buildObjects(threadReadability),
        wasRecordSharingEnabled,
      });
      expect(grantedObjectIds).toEqual(expectedObjectIds);
    },
  );
});
