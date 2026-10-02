import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const RECORD_SHARE_ACCESS_LEVEL_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.recordShare.fields.accessLevel.universalIdentifier;

export const RECORD_SHARE_NONE_ACCESS_LEVEL_OPTION: FieldMetadataComplexOption =
  {
    id: 'b6c22171-178e-4b2d-b858-02ed48c925b1',
    value: RecordShareAccessLevel.NONE,
    label: 'Restricted',
    position: 3,
    color: 'gray',
  };

// A non-nullable select can only be updated once it has a default, and the
// field was created without one; READ is also the level setRecordShare grants
// when none is given
export const RECORD_SHARE_ACCESS_LEVEL_DEFAULT_VALUE = `'${RecordShareAccessLevel.READ}'`;

const NO_OPERATIONS: FlatEntityToCreateDeleteUpdate<'fieldMetadata'> = {
  flatEntityToCreate: [],
  flatEntityToDelete: [],
  flatEntityToUpdate: [],
};

export const buildRecordShareNoneAccessLevelOptionSyncOperations = ({
  existingFlatFieldMetadataMaps,
  now,
  direction,
}: {
  existingFlatFieldMetadataMaps: Pick<
    FlatEntityMaps<FlatFieldMetadata>,
    'byUniversalIdentifier'
  >;
  now: string;
  direction: 'up' | 'down';
}): FlatEntityToCreateDeleteUpdate<'fieldMetadata'> => {
  const accessLevelField =
    existingFlatFieldMetadataMaps.byUniversalIdentifier[
      RECORD_SHARE_ACCESS_LEVEL_FIELD_UNIVERSAL_IDENTIFIER
    ];

  if (
    !isDefined(accessLevelField) ||
    accessLevelField.type !== FieldMetadataType.SELECT
  ) {
    return NO_OPERATIONS;
  }

  const existingOptions = (accessLevelField.options ??
    []) as FieldMetadataComplexOption[];
  const hasNoneOption = existingOptions.some(
    (option) => option.value === RecordShareAccessLevel.NONE,
  );

  if (direction === 'up' && !hasNoneOption) {
    return {
      ...NO_OPERATIONS,
      flatEntityToUpdate: [
        {
          ...accessLevelField,
          options: [...existingOptions, RECORD_SHARE_NONE_ACCESS_LEVEL_OPTION],
          defaultValue:
            accessLevelField.defaultValue ??
            RECORD_SHARE_ACCESS_LEVEL_DEFAULT_VALUE,
          updatedAt: now,
        },
      ],
    };
  }

  if (direction === 'down' && hasNoneOption) {
    return {
      ...NO_OPERATIONS,
      flatEntityToUpdate: [
        {
          ...accessLevelField,
          options: existingOptions.filter(
            (option) => option.value !== RecordShareAccessLevel.NONE,
          ),
          defaultValue:
            accessLevelField.defaultValue ??
            RECORD_SHARE_ACCESS_LEVEL_DEFAULT_VALUE,
          updatedAt: now,
        },
      ],
    };
  }

  return NO_OPERATIONS;
};
