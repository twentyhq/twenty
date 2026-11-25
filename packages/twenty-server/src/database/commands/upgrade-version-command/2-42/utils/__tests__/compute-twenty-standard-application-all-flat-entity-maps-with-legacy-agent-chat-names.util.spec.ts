import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { LEGACY_AGENT_CHAT_INDEX_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-42/constants/legacy-agent-chat-index-names-by-universal-identifier.constant';
import { computeTwentyStandardApplicationAllFlatEntityMapsWithLegacyAgentChatNames } from 'src/database/commands/upgrade-version-command/2-42/utils/compute-twenty-standard-application-all-flat-entity-maps-with-legacy-agent-chat-names.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { computeFlatIndexNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/compute-flat-index-name.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

jest.mock(
  'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
  () => {
    const actual = jest.requireActual(
      'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant',
    );

    return {
      ...actual,
      computeTwentyStandardApplicationAllFlatEntityMaps: jest.fn(
        actual.computeTwentyStandardApplicationAllFlatEntityMaps,
      ),
    };
  },
);

const COMPUTE_ARGS = {
  now: '2026-01-01T00:00:00Z',
  workspaceId: '20202020-1111-4111-8111-111111111111',
  twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
};

const { person, company, opportunity, workspaceMember, attachment } =
  STANDARD_OBJECTS;

const RELEASED_CHAT_OBJECT_NAMES = [
  {
    universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    nameSingular: 'agentChatThread',
    namePlural: 'agentChatThreads',
  },
  {
    universalIdentifier:
      STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier,
    nameSingular: 'agentChatThreadParticipant',
    namePlural: 'agentChatThreadParticipants',
  },
  {
    universalIdentifier:
      STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
    nameSingular: 'agentChatThreadTarget',
    namePlural: 'agentChatThreadTargets',
  },
  {
    universalIdentifier: STANDARD_OBJECTS.agentMessage.universalIdentifier,
    nameSingular: 'agentMessage',
    namePlural: 'agentMessages',
  },
  {
    universalIdentifier: STANDARD_OBJECTS.agentMessagePart.universalIdentifier,
    nameSingular: 'agentMessagePart',
    namePlural: 'agentMessageParts',
  },
  {
    universalIdentifier:
      STANDARD_OBJECTS.agentMessageReaction.universalIdentifier,
    nameSingular: 'agentMessageReaction',
    namePlural: 'agentMessageReactions',
  },
];

const RELEASED_CHAT_RELATION_FIELD_NAMES = [
  {
    universalIdentifier:
      person.fields.agentChatThreadTargets.universalIdentifier,
    name: 'agentChatThreadTargets',
  },
  {
    universalIdentifier:
      company.fields.agentChatThreadTargets.universalIdentifier,
    name: 'agentChatThreadTargets',
  },
  {
    universalIdentifier:
      opportunity.fields.agentChatThreadTargets.universalIdentifier,
    name: 'agentChatThreadTargets',
  },
  {
    universalIdentifier:
      workspaceMember.fields.agentChatThreads.universalIdentifier,
    name: 'agentChatThreads',
  },
  {
    universalIdentifier:
      workspaceMember.fields.agentChatThreadParticipants.universalIdentifier,
    name: 'agentChatThreadParticipants',
  },
  {
    universalIdentifier:
      workspaceMember.fields.assignedAgentChatThreads.universalIdentifier,
    name: 'assignedAgentChatThreads',
  },
  {
    universalIdentifier:
      workspaceMember.fields.agentMessages.universalIdentifier,
    name: 'agentMessages',
  },
  {
    universalIdentifier:
      workspaceMember.fields.agentMessageReactions.universalIdentifier,
    name: 'agentMessageReactions',
  },
  {
    universalIdentifier:
      attachment.fields.targetAgentChatThread.universalIdentifier,
    name: 'targetAgentChatThread',
  },
];

const RELEASED_ATTACHMENT_JOIN_COLUMN_NAME = 'targetAgentChatThreadId';

const CHAT_INDEX_UNIVERSAL_IDENTIFIERS = Object.keys(
  LEGACY_AGENT_CHAT_INDEX_NAMES_BY_UNIVERSAL_IDENTIFIER,
);

const renameFlatEntities = <TFlatEntity extends SyncableFlatEntity>({
  flatEntityMaps,
  universalIdentifiers,
  renameFlatEntity,
}: {
  flatEntityMaps: FlatEntityMaps<TFlatEntity>;
  universalIdentifiers: string[];
  renameFlatEntity: (flatEntity: TFlatEntity) => TFlatEntity;
}): FlatEntityMaps<TFlatEntity> => ({
  ...flatEntityMaps,
  byUniversalIdentifier: {
    ...flatEntityMaps.byUniversalIdentifier,
    ...Object.fromEntries(
      universalIdentifiers.map((universalIdentifier) => [
        universalIdentifier,
        renameFlatEntity(
          findFlatEntityByUniversalIdentifierOrThrow({
            flatEntityMaps,
            universalIdentifier,
          }),
        ),
      ]),
    ),
  },
});

const renameRelationFieldAndJoinColumn = (
  flatFieldMetadata: FlatFieldMetadata,
): FlatFieldMetadata => {
  if (
    !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
    !isDefined(flatFieldMetadata.settings.joinColumnName)
  ) {
    return { ...flatFieldMetadata, name: 'renamedChatRelation' };
  }

  return {
    ...flatFieldMetadata,
    name: 'renamedChatRelation',
    settings: {
      ...flatFieldMetadata.settings,
      joinColumnName: 'renamedChatRelationId',
    },
    universalSettings: {
      ...flatFieldMetadata.universalSettings,
      joinColumnName: 'renamedChatRelationId',
    },
  };
};

const liveDefinitions =
  computeTwentyStandardApplicationAllFlatEntityMaps(COMPUTE_ARGS);

const liveDefinitionsAfterChatRename = {
  ...liveDefinitions,
  allFlatEntityMaps: {
    ...liveDefinitions.allFlatEntityMaps,
    flatObjectMetadataMaps: renameFlatEntities({
      flatEntityMaps: liveDefinitions.allFlatEntityMaps.flatObjectMetadataMaps,
      universalIdentifiers: RELEASED_CHAT_OBJECT_NAMES.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
      renameFlatEntity: (flatObjectMetadata) => ({
        ...flatObjectMetadata,
        nameSingular: 'renamedChatObject',
        namePlural: 'renamedChatObjects',
      }),
    }),
    flatFieldMetadataMaps: renameFlatEntities({
      flatEntityMaps: liveDefinitions.allFlatEntityMaps.flatFieldMetadataMaps,
      universalIdentifiers: RELEASED_CHAT_RELATION_FIELD_NAMES.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
      renameFlatEntity: renameRelationFieldAndJoinColumn,
    }),
    flatIndexMaps: renameFlatEntities({
      flatEntityMaps: liveDefinitions.allFlatEntityMaps.flatIndexMaps,
      universalIdentifiers: CHAT_INDEX_UNIVERSAL_IDENTIFIERS,
      renameFlatEntity: (flatIndexMetadata) => ({
        ...flatIndexMetadata,
        name: 'IDX_RENAMED',
      }),
    }),
  },
};

jest
  .mocked(computeTwentyStandardApplicationAllFlatEntityMaps)
  .mockReturnValue(liveDefinitionsAfterChatRename);

const {
  allFlatEntityMaps: {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatIndexMaps,
  },
} =
  computeTwentyStandardApplicationAllFlatEntityMapsWithLegacyAgentChatNames(
    COMPUTE_ARGS,
  );

describe('computeTwentyStandardApplicationAllFlatEntityMapsWithLegacyAgentChatNames', () => {
  describe('when the live standard definitions have renamed the chat objects, their relation fields and their indexes', () => {
    it('should still return the six chat objects under the names released upgrade commands created', () => {
      expect(
        RELEASED_CHAT_OBJECT_NAMES.map(({ universalIdentifier }) => {
          const { nameSingular, namePlural } =
            findFlatEntityByUniversalIdentifierOrThrow({
              flatEntityMaps: flatObjectMetadataMaps,
              universalIdentifier,
            });

          return { universalIdentifier, nameSingular, namePlural };
        }),
      ).toEqual(RELEASED_CHAT_OBJECT_NAMES);
    });

    it('should still return the nine relation fields pointing at chat objects under their released names', () => {
      expect(
        RELEASED_CHAT_RELATION_FIELD_NAMES.map(({ universalIdentifier }) => ({
          universalIdentifier,
          name: findFlatEntityByUniversalIdentifierOrThrow({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier,
          }).name,
        })),
      ).toEqual(RELEASED_CHAT_RELATION_FIELD_NAMES);
    });

    it('should still return the attachment relation to a chat thread with its released join column', () => {
      const { settings, universalSettings } =
        findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier:
            attachment.fields.targetAgentChatThread.universalIdentifier,
        });

      expect(settings).toMatchObject({
        joinColumnName: RELEASED_ATTACHMENT_JOIN_COLUMN_NAME,
      });
      expect(universalSettings).toMatchObject({
        joinColumnName: RELEASED_ATTACHMENT_JOIN_COLUMN_NAME,
      });
    });

    it('should still return the 21 chat indexes under the names hashed from the released table and column names', () => {
      expect(CHAT_INDEX_UNIVERSAL_IDENTIFIERS).toHaveLength(21);

      for (const universalIdentifier of CHAT_INDEX_UNIVERSAL_IDENTIFIERS) {
        const flatIndexMetadata = findFlatEntityByUniversalIdentifierOrThrow({
          flatEntityMaps: flatIndexMaps,
          universalIdentifier,
        });

        const nameHashedFromReleasedTableAndColumnNames =
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
          });

        expect(flatIndexMetadata.name).toBe(
          nameHashedFromReleasedTableAndColumnNames,
        );
      }
    });
  });
});
