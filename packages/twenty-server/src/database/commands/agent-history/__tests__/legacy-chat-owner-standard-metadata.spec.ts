import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  computeLegacyChatOwnerStandardMetadata,
  LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/agent-history/utils/compute-legacy-chat-owner-standard-metadata.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-current-twenty-standard-application-all-flat-entity-maps.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps as computeShippedUpgradeMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const args = {
  workspaceId: '20202020-1111-4111-8111-111111111111',
  twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  now: '2026-09-27T00:00:00.000Z',
};
const memberIdentifier =
  STANDARD_OBJECTS.agentChatThread.fields.workspaceMember.universalIdentifier;

describe('Chat owner expand and contract metadata', () => {
  it('provisions new workspaces with a required member and no legacy owner field or index', () => {
    const { allFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps(args);
    expect(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        memberIdentifier
      ],
    ).toMatchObject({ isNullable: false, settings: { onDelete: 'CASCADE' } });
    expect(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER
      ],
    ).toBeUndefined();
    expect(
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
        LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER
      ],
    ).toBeUndefined();
  });
  it.each([
    computeLegacyChatOwnerStandardMetadata,
    computeShippedUpgradeMetadata,
  ])(
    'preserves the old copy and expansion shape for shipped commands',
    (compute) => {
      const { allFlatEntityMaps, idByUniversalIdentifierByMetadataName } =
        compute(args);
      const legacyField =
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          LEGACY_CHAT_OWNER_FIELD_UNIVERSAL_IDENTIFIER
        ]!;
      const legacyIndex =
        allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
          LEGACY_CHAT_OWNER_INDEX_UNIVERSAL_IDENTIFIER
        ]!;
      expect(legacyField).toMatchObject({
        name: 'userWorkspaceId',
        type: 'UUID',
        isNullable: false,
        isUnique: false,
        defaultValue: null,
        writability: 'SYSTEM',
      });
      expect(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          memberIdentifier
        ],
      ).toMatchObject({ isNullable: true });
      expect(legacyIndex.flatIndexFieldMetadatas[0]).toMatchObject({
        fieldMetadataId: legacyField.id,
        indexMetadataId: legacyIndex.id,
      });
      expect(
        idByUniversalIdentifierByMetadataName.fieldMetadata![
          legacyField.universalIdentifier
        ],
      ).toBe(legacyField.id);
      expect(
        idByUniversalIdentifierByMetadataName.index![
          legacyIndex.universalIdentifier
        ],
      ).toBe(legacyIndex.id);
    },
  );
});
