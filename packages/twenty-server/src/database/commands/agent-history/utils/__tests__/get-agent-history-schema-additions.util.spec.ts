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

const HISTORY_IDENTIFIERS: string[] = [
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
      additions.objects.every(
        (object) =>
          object.readability === MetadataReadability.SYSTEM &&
          object.writability === MetadataWritability.SYSTEM,
      ),
    ).toBe(true);
    expect(
      additions.fields
        .filter((field) =>
          HISTORY_IDENTIFIERS.includes(field.objectMetadataUniversalIdentifier),
        )
        .every((field) => field.writability === MetadataWritability.SYSTEM),
    ).toBe(true);
    expect(additions.fields.length).toBeGreaterThan(0);
    expect(additions.indexes.length).toBeGreaterThan(0);
    for (const field of additions.fields) {
      expect(
        HISTORY_IDENTIFIERS.includes(field.objectMetadataUniversalIdentifier) ||
          HISTORY_IDENTIFIERS.includes(
            field.relationTargetObjectMetadataUniversalIdentifier ?? '',
          ),
      ).toBe(true);
    }
    for (const index of additions.indexes) {
      expect(HISTORY_IDENTIFIERS).toContain(
        index.objectMetadataUniversalIdentifier,
      );
    }
  });

  it('adds both sides of the thread owner relation', () => {
    const additions = getAgentHistorySchemaAdditions({
      existing: {
        flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        flatIndexMaps: createEmptyFlatEntityMaps(),
      },
      standard: createStandardMetadata(),
    });
    const fieldIdentifiers = additions.fields.map(
      (field) => field.universalIdentifier,
    );

    expect(fieldIdentifiers).toContain(
      STANDARD_OBJECTS.agentChatThread.fields.workspaceMember
        .universalIdentifier,
    );
    expect(fieldIdentifiers).toContain(
      STANDARD_OBJECTS.workspaceMember.fields.agentChatThreads
        .universalIdentifier,
    );
  });

  it('protects history fields only and keeps inverse fields standard', () => {
    const standard = createStandardMetadata();
    const additions = getAgentHistorySchemaAdditions({
      existing: {
        flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
        flatIndexMaps: createEmptyFlatEntityMaps(),
      },
      standard,
    });
    const inverseIdentifier =
      STANDARD_OBJECTS.workspaceMember.fields.agentChatThreads
        .universalIdentifier;

    expect(
      additions.fields.find(
        (field) => field.universalIdentifier === inverseIdentifier,
      )?.writability,
    ).toBe(
      standard.flatFieldMetadataMaps.byUniversalIdentifier[inverseIdentifier]
        ?.writability,
    );
    for (const field of additions.fields.filter((field) =>
      HISTORY_IDENTIFIERS.includes(field.objectMetadataUniversalIdentifier),
    )) {
      expect(field.writability).toBe(MetadataWritability.SYSTEM);
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

  it('accepts protected legacy history before the sharing upgrade', () => {
    const standard = createStandardMetadata();
    const existing = createStandardMetadata();
    Object.assign(
      existing.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ]!,
      {
        readability: MetadataReadability.SYSTEM,
        writability: MetadataWritability.SYSTEM,
      },
    );
    expect(
      getAgentHistorySchemaAdditions({ existing, standard }).objects,
    ).toEqual([]);
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
    {
      readability: MetadataReadability.SYSTEM,
      writability: MetadataWritability.OPEN,
    },
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
