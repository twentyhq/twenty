import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_METADATA_TECHNICAL_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/inbox-metadata-technical-names.constant';
import { LEGACY_INBOX_METADATA_TECHNICAL_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/legacy-inbox-metadata-technical-names.constant';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { applyStandardMetadataTechnicalNamesOrThrow } from 'src/engine/workspace-manager/twenty-standard-application/utils/apply-standard-metadata-technical-names-or-throw.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const FACTORY_ARGUMENTS = {
  now: '2026-11-05T00:00:00.000Z',
  workspaceId: '20202020-1111-4111-8111-111111111111',
  twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
};
const INBOX_AGENT_RELATION_NAME_PATTERN =
  /(?:agentChatThread|AgentChatThread|agentMessage|AgentMessage)/;
const { allFlatEntityMaps: legacyMetadata } =
  computeTwentyStandardApplicationAllFlatEntityMaps(FACTORY_ARGUMENTS);

describe('inbox metadata technical names', () => {
  it('covers the same six objects and every affected standard relation identity', () => {
    const expectedObjectUniversalIdentifiers = [
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier,
      STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
      STANDARD_OBJECTS.agentMessage.universalIdentifier,
      STANDARD_OBJECTS.agentMessagePart.universalIdentifier,
      STANDARD_OBJECTS.agentMessageReaction.universalIdentifier,
    ].sort();
    const agentPrefixedRelationNamesByUniversalIdentifier = Object.fromEntries(
      Object.values(legacyMetadata.flatFieldMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(isMorphOrRelationFlatFieldMetadata)
        .filter((fieldMetadata) =>
          INBOX_AGENT_RELATION_NAME_PATTERN.test(fieldMetadata.name),
        )
        .map((fieldMetadata) => [
          fieldMetadata.universalIdentifier,
          fieldMetadata.name,
        ]),
    );

    expect(
      Object.keys(LEGACY_INBOX_METADATA_TECHNICAL_NAMES.objects).sort(),
    ).toEqual(expectedObjectUniversalIdentifiers);
    expect(Object.keys(INBOX_METADATA_TECHNICAL_NAMES.objects).sort()).toEqual(
      expectedObjectUniversalIdentifiers,
    );
    expect(LEGACY_INBOX_METADATA_TECHNICAL_NAMES.fields).toEqual(
      agentPrefixedRelationNamesByUniversalIdentifier,
    );
    expect(Object.keys(INBOX_METADATA_TECHNICAL_NAMES.fields).sort()).toEqual(
      Object.keys(agentPrefixedRelationNamesByUniversalIdentifier).sort(),
    );
    expect(
      Object.values(INBOX_METADATA_TECHNICAL_NAMES.fields).some((fieldName) =>
        INBOX_AGENT_RELATION_NAME_PATTERN.test(fieldName),
      ),
    ).toBe(false);
  });

  it('uses inbox names and owning storage columns only with an explicit factory override', () => {
    const { allFlatEntityMaps: inboxMetadata } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        ...FACTORY_ARGUMENTS,
        technicalNamesByUniversalIdentifier: INBOX_METADATA_TECHNICAL_NAMES,
      });

    for (const [universalIdentifier, technicalNames] of Object.entries(
      INBOX_METADATA_TECHNICAL_NAMES.objects,
    )) {
      const objectMetadata = findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: inboxMetadata.flatObjectMetadataMaps,
        universalIdentifier,
      });

      expect(objectMetadata).toMatchObject(technicalNames);
      expect(computeObjectTargetTable(objectMetadata)).toBe(
        technicalNames.nameSingular,
      );
    }

    for (const [universalIdentifier, name] of Object.entries(
      INBOX_METADATA_TECHNICAL_NAMES.fields,
    )) {
      expect(
        findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: inboxMetadata.flatFieldMetadataMaps,
          universalIdentifier,
        }),
      ).toMatchObject({ name });
    }

    expect(
      inboxMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
          .universalIdentifier
      ],
    ).toMatchObject({
      name: 'targetInboxThread',
      settings: { joinColumnName: 'targetInboxThreadId' },
      universalSettings: { joinColumnName: 'targetInboxThreadId' },
    });
    expect(
      inboxMetadata.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentTurn.universalIdentifier
      ],
    ).toMatchObject({ nameSingular: 'agentTurn', namePlural: 'agentTurns' });
    expect(
      inboxMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentMessage.fields.agentId.universalIdentifier
      ],
    ).toMatchObject({ name: 'agentId' });
  });

  it('restores legacy names without changing metadata identities or relation links', () => {
    const inboxMetadata = applyStandardMetadataTechnicalNamesOrThrow({
      allFlatEntityMaps: legacyMetadata,
      technicalNamesByUniversalIdentifier: INBOX_METADATA_TECHNICAL_NAMES,
    });
    const restoredMetadata = applyStandardMetadataTechnicalNamesOrThrow({
      allFlatEntityMaps: inboxMetadata,
      technicalNamesByUniversalIdentifier:
        LEGACY_INBOX_METADATA_TECHNICAL_NAMES,
    });

    expect(inboxMetadata.flatObjectMetadataMaps.universalIdentifierById).toBe(
      legacyMetadata.flatObjectMetadataMaps.universalIdentifierById,
    );
    expect(inboxMetadata.flatFieldMetadataMaps.universalIdentifierById).toBe(
      legacyMetadata.flatFieldMetadataMaps.universalIdentifierById,
    );
    expect(inboxMetadata.flatIndexMaps).toBe(legacyMetadata.flatIndexMaps);
    expect(restoredMetadata).toEqual(legacyMetadata);
  });

  it('keeps legacy names as the standard factory default after using inbox names', () => {
    computeTwentyStandardApplicationAllFlatEntityMaps({
      ...FACTORY_ARGUMENTS,
      technicalNamesByUniversalIdentifier: INBOX_METADATA_TECHNICAL_NAMES,
    });
    const { allFlatEntityMaps: defaultMetadata } =
      computeTwentyStandardApplicationAllFlatEntityMaps(FACTORY_ARGUMENTS);

    for (const [universalIdentifier, technicalNames] of Object.entries(
      LEGACY_INBOX_METADATA_TECHNICAL_NAMES.objects,
    )) {
      const objectMetadata = findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: defaultMetadata.flatObjectMetadataMaps,
        universalIdentifier,
      });

      expect(objectMetadata).toMatchObject(technicalNames);
      expect(computeObjectTargetTable(objectMetadata)).toBe(
        technicalNames.nameSingular,
      );
    }

    expect(
      defaultMetadata.flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
          .universalIdentifier
      ],
    ).toMatchObject({
      name: 'targetAgentChatThread',
      settings: { joinColumnName: 'targetAgentChatThreadId' },
    });
  });
});
