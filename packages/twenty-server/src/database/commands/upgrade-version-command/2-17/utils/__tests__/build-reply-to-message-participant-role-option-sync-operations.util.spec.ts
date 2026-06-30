import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
  MessageParticipantRole,
} from 'twenty-shared/types';

import {
  buildReplyToMessageParticipantRoleOptionSyncOperations,
  REPLY_TO_MESSAGE_PARTICIPANT_ROLE_OPTION,
} from 'src/database/commands/upgrade-version-command/2-17/utils/build-reply-to-message-participant-role-option-sync-operations.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const ROLE_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageParticipant.fields.role.universalIdentifier;
const NOW = '2026-06-26T00:00:00.000Z';

const buildRoleOption = (
  value: MessageParticipantRole,
  position: number,
): FieldMetadataComplexOption => ({
  id: `option-${value}`,
  value,
  label: value,
  position,
  color: 'gray',
});

const buildFlatFieldMetadataMaps = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildRoleField = (options: FieldMetadataComplexOption[]) =>
  getFlatFieldMetadataMock({
    universalIdentifier: ROLE_FIELD_UNIVERSAL_IDENTIFIER,
    objectMetadataId: 'message-participant-object-id',
    type: FieldMetadataType.SELECT,
    options,
  });

describe('buildReplyToMessageParticipantRoleOptionSyncOperations', () => {
  it('appends the Reply To option to the existing role options without touching them', () => {
    const roleField = buildRoleField([
      buildRoleOption(MessageParticipantRole.FROM, 0),
      buildRoleOption(MessageParticipantRole.TO, 1),
      buildRoleOption(MessageParticipantRole.CC, 2),
      buildRoleOption(MessageParticipantRole.BCC, 3),
    ]);

    const { flatEntityToUpdate } =
      buildReplyToMessageParticipantRoleOptionSyncOperations({
        existingFlatFieldMetadataMaps: buildFlatFieldMetadataMaps([roleField]),
        now: NOW,
      });

    expect(flatEntityToUpdate).toHaveLength(1);
    expect(flatEntityToUpdate[0]).toMatchObject({
      universalIdentifier: ROLE_FIELD_UNIVERSAL_IDENTIFIER,
      updatedAt: NOW,
      options: [
        ...(roleField.options as FieldMetadataComplexOption[]),
        REPLY_TO_MESSAGE_PARTICIPANT_ROLE_OPTION,
      ],
    });
  });

  it('does nothing when the Reply To option is already present so the upgrade can be re-run safely', () => {
    const roleField = buildRoleField([
      buildRoleOption(MessageParticipantRole.FROM, 0),
      REPLY_TO_MESSAGE_PARTICIPANT_ROLE_OPTION,
    ]);

    const { flatEntityToUpdate } =
      buildReplyToMessageParticipantRoleOptionSyncOperations({
        existingFlatFieldMetadataMaps: buildFlatFieldMetadataMaps([roleField]),
        now: NOW,
      });

    expect(flatEntityToUpdate).toHaveLength(0);
  });

  it('does nothing when the workspace has no messageParticipant role field', () => {
    const { flatEntityToUpdate } =
      buildReplyToMessageParticipantRoleOptionSyncOperations({
        existingFlatFieldMetadataMaps: buildFlatFieldMetadataMaps([]),
        now: NOW,
      });

    expect(flatEntityToUpdate).toHaveLength(0);
  });
});
