import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { LEGACY_AGENT_CHAT_INDEX_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-index-names-by-universal-identifier.constant';
import { computeTwentyStandardApplicationAllFlatEntityMapsWithLegacyAgentChatNames } from 'src/database/commands/upgrade-version-command/2-42/utils/compute-twenty-standard-application-all-flat-entity-maps-with-legacy-agent-chat-names.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { computeFlatIndexNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/compute-flat-index-name.util';

const {
  allFlatEntityMaps: {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatIndexMaps,
  },
} = computeTwentyStandardApplicationAllFlatEntityMapsWithLegacyAgentChatNames({
  now: '2026-01-01T00:00:00Z',
  workspaceId: '20202020-1111-4111-8111-111111111111',
  twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
});

const getObjectNames = (universalIdentifier: string) => {
  const { nameSingular, namePlural } =
    findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier,
    });

  return { nameSingular, namePlural };
};

const getField = (universalIdentifier: string) =>
  findFlatEntityByUniversalIdentifierOrThrow({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier,
  });

describe('computeTwentyStandardApplicationAllFlatEntityMapsWithLegacyAgentChatNames', () => {
  it('should name the chat objects as released upgrade commands created them', () => {
    expect(
      [
        STANDARD_OBJECTS.agentChatThread,
        STANDARD_OBJECTS.agentChatThreadParticipant,
        STANDARD_OBJECTS.agentChatThreadTarget,
        STANDARD_OBJECTS.agentMessage,
        STANDARD_OBJECTS.agentMessagePart,
        STANDARD_OBJECTS.agentMessageReaction,
      ].map(({ universalIdentifier }) => getObjectNames(universalIdentifier)),
    ).toEqual([
      { nameSingular: 'agentChatThread', namePlural: 'agentChatThreads' },
      {
        nameSingular: 'agentChatThreadParticipant',
        namePlural: 'agentChatThreadParticipants',
      },
      {
        nameSingular: 'agentChatThreadTarget',
        namePlural: 'agentChatThreadTargets',
      },
      { nameSingular: 'agentMessage', namePlural: 'agentMessages' },
      { nameSingular: 'agentMessagePart', namePlural: 'agentMessageParts' },
      {
        nameSingular: 'agentMessageReaction',
        namePlural: 'agentMessageReactions',
      },
    ]);
  });

  it('should name the relation fields pointing at chat objects as released upgrade commands created them', () => {
    const { person, company, opportunity, workspaceMember, attachment } =
      STANDARD_OBJECTS;

    expect(
      [
        person.fields.agentChatThreadTargets,
        company.fields.agentChatThreadTargets,
        opportunity.fields.agentChatThreadTargets,
        workspaceMember.fields.agentChatThreads,
        workspaceMember.fields.agentChatThreadParticipants,
        workspaceMember.fields.assignedAgentChatThreads,
        workspaceMember.fields.agentMessages,
        workspaceMember.fields.agentMessageReactions,
      ].map(({ universalIdentifier }) => getField(universalIdentifier).name),
    ).toEqual([
      'agentChatThreadTargets',
      'agentChatThreadTargets',
      'agentChatThreadTargets',
      'agentChatThreads',
      'agentChatThreadParticipants',
      'assignedAgentChatThreads',
      'agentMessages',
      'agentMessageReactions',
    ]);

    const attachmentTargetField = getField(
      attachment.fields.targetAgentChatThread.universalIdentifier,
    );

    expect(attachmentTargetField.name).toBe('targetAgentChatThread');
    expect(attachmentTargetField.settings).toMatchObject({
      joinColumnName: 'targetAgentChatThreadId',
    });
    expect(attachmentTargetField.universalSettings).toMatchObject({
      joinColumnName: 'targetAgentChatThreadId',
    });
  });

  it('should keep the index names derived from the released table and column names', () => {
    const indexUniversalIdentifiers = Object.keys(
      LEGACY_AGENT_CHAT_INDEX_NAMES_BY_UNIVERSAL_IDENTIFIER,
    );

    expect(indexUniversalIdentifiers).toHaveLength(21);

    for (const universalIdentifier of indexUniversalIdentifiers) {
      const flatIndexMetadata = findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: flatIndexMaps,
        universalIdentifier,
      });

      expect(flatIndexMetadata.name).toBe(
        computeFlatIndexNameOrThrow({
          flatObjectMetadata: findFlatEntityByUniversalIdentifierOrThrow({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier:
              flatIndexMetadata.objectMetadataUniversalIdentifier,
          }),
          objectFlatFieldMetadatas: Object.values(
            flatFieldMetadataMaps.byUniversalIdentifier,
          )
            .filter(isDefined)
            .filter(
              (flatFieldMetadata) =>
                flatFieldMetadata.objectMetadataUniversalIdentifier ===
                flatIndexMetadata.objectMetadataUniversalIdentifier,
            ),
          indexFields: flatIndexMetadata.universalFlatIndexFieldMetadatas,
          isUnique: flatIndexMetadata.isUnique,
          indexWhereClause: flatIndexMetadata.indexWhereClause,
        }),
      );
    }
  });
});
