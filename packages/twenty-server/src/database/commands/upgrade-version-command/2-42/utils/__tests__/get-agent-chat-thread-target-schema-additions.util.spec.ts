import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getAgentChatThreadTargetSchemaAdditions } from 'src/database/commands/upgrade-version-command/2-42/utils/get-agent-chat-thread-target-schema-additions.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const TARGET_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier;
const THREAD_IDENTIFIER = STANDARD_OBJECTS.agentChatThread.universalIdentifier;
const RECORD_TARGETS_IDENTIFIER =
  STANDARD_OBJECT_FIELDS.agentChatThread.recordTargets.universalIdentifier;

const createStandardMetadata = () =>
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-01-01T00:00:00Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  }).allFlatEntityMaps;

// A workspace that already carries agent history but not the target object.
const createExistingWithoutTarget = ({
  withoutObjectUniversalIdentifier,
}: { withoutObjectUniversalIdentifier?: string } = {}) => {
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
        (identifier) =>
          identifier !== TARGET_IDENTIFIER &&
          identifier !== withoutObjectUniversalIdentifier,
      ),
    },
    flatFieldMetadataMaps: {
      ...standard.flatFieldMetadataMaps,
      byUniversalIdentifier: keepByUniversalIdentifier(
        standard.flatFieldMetadataMaps.byUniversalIdentifier,
        (identifier, field) =>
          field.objectMetadataUniversalIdentifier !== TARGET_IDENTIFIER &&
          identifier !== RECORD_TARGETS_IDENTIFIER,
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
  it('provisions the object with both legs of its relation', () => {
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

    // The far leg lives on agentChatThread, so selecting by owning object alone
    // would emit half a relation — but a filter that emitted ONLY the far leg
    // would satisfy that on its own, so assert the near side too.
    expect(fieldIdentifiers).toContain(RECORD_TARGETS_IDENTIFIER);
    expect(fieldIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECT_FIELDS.agentChatThreadTarget.thread.universalIdentifier,
        STANDARD_OBJECT_FIELDS.agentChatThreadTarget.objectMetadataId
          .universalIdentifier,
        STANDARD_OBJECT_FIELDS.agentChatThreadTarget.recordId
          .universalIdentifier,
      ]),
    );
    expect(additions.indexes.length).toBeGreaterThan(0);
  });

  it('adds nothing when the workspace has no agent chat thread yet', () => {
    const existing = createExistingWithoutTarget({
      withoutObjectUniversalIdentifier: THREAD_IDENTIFIER,
    });

    // Both legs resolve against agentChatThread; the agent history migration
    // skips a workspace with no workspace schema, so it may not be there yet.
    expect(
      getAgentChatThreadTargetSchemaAdditions({
        existing,
        standard: createStandardMetadata(),
      }),
    ).toEqual({ objects: [], fields: [], indexes: [] });
  });

  it('adds nothing when the target object already exists', () => {
    const standard = createStandardMetadata();

    expect(
      getAgentChatThreadTargetSchemaAdditions({ existing: standard, standard }),
    ).toEqual({ objects: [], fields: [], indexes: [] });
  });

  it('adds nothing to a workspace with no standard metadata at all', () => {
    expect(
      getAgentChatThreadTargetSchemaAdditions({
        existing: {
          flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
          flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
          flatIndexMaps: createEmptyFlatEntityMaps(),
        },
        standard: createStandardMetadata(),
      }),
    ).toEqual({ objects: [], fields: [], indexes: [] });
  });
});
