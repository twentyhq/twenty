import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataWritability } from 'twenty-shared/types';

import { getLegacyAgentHistoryFlatFieldMetadatas } from 'src/database/commands/agent-history/utils/get-legacy-agent-history-flat-field-metadatas.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

describe('getLegacyAgentHistoryFlatFieldMetadatas', () => {
  const standard = computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-01-01T00:00:00Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  }).allFlatEntityMaps;

  it('adds the dropped columns to the thread and message objects, protected', () => {
    const fields = getLegacyAgentHistoryFlatFieldMetadatas({ standard });

    expect(
      fields.map(({ objectMetadataUniversalIdentifier, name }) => [
        objectMetadataUniversalIdentifier,
        name,
      ]),
    ).toEqual([
      [STANDARD_OBJECTS.agentChatThread.universalIdentifier, 'userWorkspaceId'],
      [STANDARD_OBJECTS.agentChatThread.universalIdentifier, 'lastStreamError'],
      [
        STANDARD_OBJECTS.agentMessage.universalIdentifier,
        'senderUserWorkspaceId',
      ],
      [STANDARD_OBJECTS.agentMessage.universalIdentifier, 'isHidden'],
    ]);
    for (const field of fields) {
      expect(field.objectMetadataId).toBe(
        standard.flatObjectMetadataMaps.byUniversalIdentifier[
          field.objectMetadataUniversalIdentifier
        ]?.id,
      );
      expect(field.writability).toBe(MetadataWritability.SYSTEM);
    }
  });

  it('does not collide with any current standard field', () => {
    const standardFields = Object.values(
      standard.flatFieldMetadataMaps.byUniversalIdentifier,
    );

    for (const field of getLegacyAgentHistoryFlatFieldMetadatas({ standard })) {
      expect(
        standard.flatFieldMetadataMaps.byUniversalIdentifier[
          field.universalIdentifier
        ],
      ).toBeUndefined();
      expect(standardFields).not.toContainEqual(
        expect.objectContaining({
          objectMetadataUniversalIdentifier:
            field.objectMetadataUniversalIdentifier,
          name: field.name,
        }),
      );
    }
  });
});
