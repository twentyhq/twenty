import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const TITLE_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.fields.title.universalIdentifier;
const ID_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.fields.id.universalIdentifier;
const ARCHIVED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.fields.archivedAt.universalIdentifier;

const TARGET_BY_DIRECTION = {
  up: {
    object: {
      labelSingular: 'Chat',
      labelPlural: 'Chats',
      isUIEditable: true,
      labelIdentifierFieldUniversalIdentifier: TITLE_FIELD_UNIVERSAL_IDENTIFIER,
    },
    isTitleUIEditable: true,
    archivedAtWritability: MetadataWritability.SYSTEM,
  },
  down: {
    object: {
      labelSingular: 'Agent chat thread',
      labelPlural: 'Agent chat threads',
      isUIEditable: false,
      labelIdentifierFieldUniversalIdentifier: ID_FIELD_UNIVERSAL_IDENTIFIER,
    },
    isTitleUIEditable: false,
    archivedAtWritability: MetadataWritability.OPEN,
  },
} as const;

export const buildAgentChatThreadRecordModelUpdates = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  now,
  direction,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  now: string;
  direction: 'up' | 'down';
}): {
  objectToUpdate: FlatObjectMetadata | undefined;
  fieldsToUpdate: FlatFieldMetadata[];
} => {
  const target = TARGET_BY_DIRECTION[direction];
  const chatObject =
    flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ];
  const titleField =
    flatFieldMetadataMaps.byUniversalIdentifier[
      TITLE_FIELD_UNIVERSAL_IDENTIFIER
    ];
  const labelIdentifierField =
    flatFieldMetadataMaps.byUniversalIdentifier[
      target.object.labelIdentifierFieldUniversalIdentifier
    ];
  const archivedAtField =
    flatFieldMetadataMaps.byUniversalIdentifier[
      ARCHIVED_AT_FIELD_UNIVERSAL_IDENTIFIER
    ];

  if (
    !isDefined(chatObject) ||
    !isDefined(titleField) ||
    !isDefined(labelIdentifierField)
  ) {
    return { objectToUpdate: undefined, fieldsToUpdate: [] };
  }

  const isObjectUpToDate =
    chatObject.labelSingular === target.object.labelSingular &&
    chatObject.labelPlural === target.object.labelPlural &&
    chatObject.isUIEditable === target.object.isUIEditable &&
    chatObject.labelIdentifierFieldMetadataId === labelIdentifierField.id;

  const fieldsToUpdate: FlatFieldMetadata[] = [];

  if (titleField.isUIEditable !== target.isTitleUIEditable) {
    fieldsToUpdate.push({
      ...titleField,
      isUIEditable: target.isTitleUIEditable,
      updatedAt: now,
    });
  }

  if (
    isDefined(archivedAtField) &&
    archivedAtField.writability !== target.archivedAtWritability
  ) {
    fieldsToUpdate.push({
      ...archivedAtField,
      writability: target.archivedAtWritability,
      updatedAt: now,
    });
  }

  return {
    objectToUpdate: isObjectUpToDate
      ? undefined
      : {
          ...chatObject,
          labelSingular: target.object.labelSingular,
          labelPlural: target.object.labelPlural,
          isUIEditable: target.object.isUIEditable,
          labelIdentifierFieldMetadataId: labelIdentifierField.id,
          labelIdentifierFieldMetadataUniversalIdentifier:
            labelIdentifierField.universalIdentifier,
          updatedAt: now,
        },
    fieldsToUpdate,
  };
};
