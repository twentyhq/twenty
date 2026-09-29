import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getAgentChatThreadTargetSchemaAdditions } from 'src/database/commands/upgrade-version-command/2-43/utils/get-agent-chat-thread-target-schema-additions.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const TARGET_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier;
const RECORD_TARGETS_IDENTIFIER =
  STANDARD_OBJECT_FIELDS.agentChatThread.recordTargets.universalIdentifier;

// The reverse side of each standard leg, owned by the object the leg points at.
const STANDARD_REVERSE_FIELD_IDENTIFIERS = [
  STANDARD_OBJECT_FIELDS.person.agentChatThreadTargets.universalIdentifier,
  STANDARD_OBJECT_FIELDS.company.agentChatThreadTargets.universalIdentifier,
  STANDARD_OBJECT_FIELDS.opportunity.agentChatThreadTargets.universalIdentifier,
];

const createStandardMetadata = () =>
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-01-01T00:00:00Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  }).allFlatEntityMaps;

// A workspace that already carries agent history but not the target object.
const createExistingWithoutTarget = () => {
  const standard = createStandardMetadata();

  const keepByUniversalIdentifier = <TFlatEntity>(
    byUniversalIdentifier: Partial<Record<string, TFlatEntity>>,
    shouldKeep: (identifier: string, flatEntity: TFlatEntity) => boolean,
  ) =>
    Object.fromEntries(
      Object.entries(byUniversalIdentifier).filter(
        ([identifier, flatEntity]) =>
          isDefined(flatEntity) && shouldKeep(identifier, flatEntity),
      ),
    );

  return {
    flatObjectMetadataMaps: {
      ...standard.flatObjectMetadataMaps,
      byUniversalIdentifier: keepByUniversalIdentifier(
        standard.flatObjectMetadataMaps.byUniversalIdentifier,
        (identifier) => identifier !== TARGET_IDENTIFIER,
      ),
    },
    flatFieldMetadataMaps: {
      ...standard.flatFieldMetadataMaps,
      byUniversalIdentifier: keepByUniversalIdentifier(
        standard.flatFieldMetadataMaps.byUniversalIdentifier,
        (identifier, field) =>
          field.objectMetadataUniversalIdentifier !== TARGET_IDENTIFIER &&
          identifier !== RECORD_TARGETS_IDENTIFIER &&
          !STANDARD_REVERSE_FIELD_IDENTIFIERS.includes(identifier),
      ),
    },
    flatIndexMaps: {
      ...standard.flatIndexMaps,
      byUniversalIdentifier: keepByUniversalIdentifier(
        standard.flatIndexMaps.byUniversalIdentifier,
        (_identifier, index) =>
          index.objectMetadataUniversalIdentifier !== TARGET_IDENTIFIER,
      ),
    },
  };
};

describe('getAgentChatThreadTargetSchemaAdditions', () => {
  it('provisions the object with both sides of every relation', () => {
    const additions = getAgentChatThreadTargetSchemaAdditions({
      existing: createExistingWithoutTarget(),
      standard: createStandardMetadata(),
    });

    expect(
      additions.objects.map((object) => object.universalIdentifier),
    ).toEqual([TARGET_IDENTIFIER]);

    const fieldIdentifiers = additions.fields.map(
      (field) => field.universalIdentifier,
    );

    // The far sides live on agentChatThread and on the objects the legs point
    // at, so selecting by owning object alone would emit half relations — but a
    // filter that emitted ONLY the far sides would satisfy that on its own, so
    // assert the near side too.
    expect(fieldIdentifiers).toEqual(
      expect.arrayContaining([
        RECORD_TARGETS_IDENTIFIER,
        ...STANDARD_REVERSE_FIELD_IDENTIFIERS,
        STANDARD_OBJECT_FIELDS.agentChatThreadTarget.thread.universalIdentifier,
        STANDARD_OBJECT_FIELDS.agentChatThreadTarget.targetPerson
          .universalIdentifier,
        STANDARD_OBJECT_FIELDS.agentChatThreadTarget.targetCompany
          .universalIdentifier,
        STANDARD_OBJECT_FIELDS.agentChatThreadTarget.targetOpportunity
          .universalIdentifier,
      ]),
    );
    expect(additions.indexes.length).toBeGreaterThan(0);
  });

  it('adds nothing when the target object already exists', () => {
    const standard = createStandardMetadata();

    expect(
      getAgentChatThreadTargetSchemaAdditions({ existing: standard, standard }),
    ).toEqual({ objects: [], fields: [], indexes: [] });
  });

  // Whether the workspace is ready for this is the command's question, not this
  // util's: it only ever proposes the target's own schema plus the far sides of
  // its relations, so a workspace missing everything gets the same set as one
  // missing only the target.
  it('proposes only the target schema even when the workspace has nothing', () => {
    const standard = createStandardMetadata();

    expect(
      getAgentChatThreadTargetSchemaAdditions({
        existing: {
          flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
          flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
          flatIndexMaps: createEmptyFlatEntityMaps(),
        },
        standard,
      }),
    ).toEqual(
      getAgentChatThreadTargetSchemaAdditions({
        existing: createExistingWithoutTarget(),
        standard,
      }),
    );
  });
});
