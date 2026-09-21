import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';

import { getAgentHistorySchemaAdditions } from 'src/database/commands/agent-history/utils/get-agent-history-schema-additions.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const createStandardMetadata = () =>
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-01-01T00:00:00Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  }).allFlatEntityMaps;

const HISTORY_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  STANDARD_OBJECTS.agentTurn.universalIdentifier,
  STANDARD_OBJECTS.agentMessage.universalIdentifier,
  STANDARD_OBJECTS.agentMessagePart.universalIdentifier,
  STANDARD_OBJECTS.agentTurnEvaluation.universalIdentifier,
];

describe('getAgentHistorySchemaAdditions', () => {
  it('selects only history objects and their fields and indexes', () => {
    const additions = getAgentHistorySchemaAdditions({
      existing: {
        flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        flatIndexMaps: createEmptyFlatEntityMaps(),
      },
      standard: createStandardMetadata(),
    });
    expect(
      additions.objects.map((object) => object.universalIdentifier).sort(),
    ).toEqual([...HISTORY_IDENTIFIERS].sort());
    expect(
      additions.fields.map(({ universalIdentifier }) => universalIdentifier),
    ).not.toContain(
      STANDARD_OBJECTS.agentChatThread.fields.targets.universalIdentifier,
    );
    expect(additions.fields.length).toBeGreaterThan(0);
    expect(additions.indexes.length).toBeGreaterThan(0);
    for (const entry of [...additions.fields, ...additions.indexes]) {
      expect(HISTORY_IDENTIFIERS).toContain(
        entry.objectMetadataUniversalIdentifier,
      );
    }
  });

  it('adds nothing when all history metadata already exists', () => {
    const standard = createStandardMetadata();
    expect(
      getAgentHistorySchemaAdditions({ existing: standard, standard }),
    ).toEqual({
      objects: [],
      fields: [],
      indexes: [],
    });
  });

  it('repairs missing fields and indexes without recreating existing objects', () => {
    const standard = createStandardMetadata();
    const additions = getAgentHistorySchemaAdditions({
      existing: {
        flatObjectMetadataMaps: standard.flatObjectMetadataMaps,
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        flatIndexMaps: createEmptyFlatEntityMaps(),
      },
      standard,
    });
    expect(additions.objects).toEqual([]);
    expect(additions.fields.length).toBeGreaterThan(0);
    expect(additions.indexes.length).toBeGreaterThan(0);
  });

  it.each([
    { readability: MetadataReadability.OPEN },
    { writability: MetadataWritability.OPEN },
    { isSearchable: true },
    { isAuditLogged: true },
    { nameSingular: 'unexpectedName' },
  ])('rejects protection drift: %o', (changes) => {
    const standard = createStandardMetadata();
    const existing = createStandardMetadata();
    const identifier = STANDARD_OBJECTS.agentChatThread.universalIdentifier;
    Object.assign(
      existing.flatObjectMetadataMaps.byUniversalIdentifier[identifier]!,
      changes,
    );
    expect(() =>
      getAgentHistorySchemaAdditions({ existing, standard }),
    ).toThrow('protections have drifted');
  });
});
