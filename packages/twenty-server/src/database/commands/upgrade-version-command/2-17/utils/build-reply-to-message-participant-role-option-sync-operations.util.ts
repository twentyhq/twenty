import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
  MessageParticipantRole,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const MESSAGE_PARTICIPANT_ROLE_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.messageParticipant.fields.role.universalIdentifier;

export const REPLY_TO_MESSAGE_PARTICIPANT_ROLE_OPTION: FieldMetadataComplexOption =
  {
    id: '20202020-3b1a-4e2c-9d7f-8a6b5c4d3e2f',
    value: MessageParticipantRole.REPLY_TO,
    label: 'Reply To',
    position: 4,
    color: 'purple',
  };

export const buildReplyToMessageParticipantRoleOptionSyncOperations = ({
  existingFlatFieldMetadataMaps,
  now,
}: {
  existingFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  now: string;
}): FlatEntityToCreateDeleteUpdate<'fieldMetadata'> => {
  const roleField =
    existingFlatFieldMetadataMaps.byUniversalIdentifier[
      MESSAGE_PARTICIPANT_ROLE_FIELD_UNIVERSAL_IDENTIFIER
    ];

  const existingOptions = (roleField?.options ??
    []) as FieldMetadataComplexOption[];

  const replyToOptionIsMissing =
    roleField?.type === FieldMetadataType.SELECT &&
    !existingOptions.some(
      (option) => option.id === REPLY_TO_MESSAGE_PARTICIPANT_ROLE_OPTION.id,
    );

  if (!replyToOptionIsMissing) {
    return {
      flatEntityToCreate: [],
      flatEntityToDelete: [],
      flatEntityToUpdate: [],
    };
  }

  return {
    flatEntityToCreate: [],
    flatEntityToDelete: [],
    flatEntityToUpdate: [
      {
        ...roleField,
        options: [...existingOptions, REPLY_TO_MESSAGE_PARTICIPANT_ROLE_OPTION],
        updatedAt: now,
      },
    ],
  };
};
