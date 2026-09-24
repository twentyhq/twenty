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
  it('selects only history objects and the fields and indexes relating to them', () => {
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
    expect(additions.fields.length).toBeGreaterThan(0);
    expect(additions.indexes.length).toBeGreaterThan(0);
    const historyIdentifiers = new Set<string>(HISTORY_IDENTIFIERS);

    for (const field of additions.fields) {
      expect(
        historyIdentifiers.has(field.objectMetadataUniversalIdentifier) ||
          historyIdentifiers.has(
            field.relationTargetObjectMetadataUniversalIdentifier ?? '',
          ),
      ).toBe(true);
    }
  });

  it('provisions both sides of relations from other objects into history objects', () => {
    const standard = createStandardMetadata();
    const additions = getAgentHistorySchemaAdditions({
      existing: {
        flatObjectMetadataMaps: standard.flatObjectMetadataMaps,
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        flatIndexMaps: createEmptyFlatEntityMaps(),
      },
      standard,
    });
    const fieldIdentifiers = additions.fields.map(
      (field) => field.universalIdentifier,
    );
    const indexIdentifiers = additions.indexes.map(
      (index) => index.universalIdentifier,
    );

    expect(fieldIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.agentChatThread.fields.attachments.universalIdentifier,
        STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
          .universalIdentifier,
      ]),
    );
    expect(indexIdentifiers).toContain(
      STANDARD_OBJECTS.attachment.indexes.agentChatThreadIdIndex
        .universalIdentifier,
    );
    expect(fieldIdentifiers).not.toContain(
      STANDARD_OBJECTS.attachment.fields.targetNote.universalIdentifier,
    );
    expect(indexIdentifiers).not.toContain(
      STANDARD_OBJECTS.attachment.indexes.noteIdIndex.universalIdentifier,
    );
  });

  it('repairs a missing attachment index whose chat thread field already exists', () => {
    const standard = createStandardMetadata();
    const existing = structuredClone(standard);
    const indexIdentifier =
      STANDARD_OBJECTS.attachment.indexes.agentChatThreadIdIndex
        .universalIdentifier;

    delete existing.flatIndexMaps.byUniversalIdentifier[indexIdentifier];

    const additions = getAgentHistorySchemaAdditions({ existing, standard });

    expect(additions.fields).toEqual([]);
    expect(additions.indexes.map((index) => index.universalIdentifier)).toEqual(
      [indexIdentifier],
    );
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
