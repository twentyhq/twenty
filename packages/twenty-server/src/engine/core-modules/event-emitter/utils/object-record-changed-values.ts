import deepEqual from 'deep-equal';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { fastDeepEqual } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const LARGE_JSON_FIELDS: Record<string, Set<string>> = {
  [STANDARD_OBJECT_IDS.workflowVersion]: new Set(['steps', 'trigger']),
  [STANDARD_OBJECT_IDS.workflowAutomatedTrigger]: new Set(['settings']),
  [STANDARD_OBJECT_IDS.workflowRun]: new Set(['state']),
};

const isLargeJsonField = (
  objectMetadataItem: Pick<FlatObjectMetadata, 'standardId'>,
  key: string,
): boolean => {
  const standardId = objectMetadataItem.standardId;

  if (!standardId) {
    return false;
  }

  return LARGE_JSON_FIELDS[standardId]?.has(key) ?? false;
};

export const objectRecordChangedValues = (
  oldRecord: Partial<ObjectRecord>,
  newRecord: Partial<ObjectRecord>,
  objectMetadataItem: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) => {
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    objectMetadataItem,
  );

  return Object.keys(newRecord).reduce(
    (acc, key) => {
      const fieldId = fieldIdByName[key];
      const field = fieldId ? flatFieldMetadataMaps.byId[fieldId] : undefined;

      const oldRecordValue = oldRecord[key];
      const newRecordValue = newRecord[key];

      if (
        key === 'updatedAt' ||
        key === 'searchVector' ||
        field?.type === FieldMetadataType.RELATION
      ) {
        return acc;
      }

      if (isLargeJsonField(objectMetadataItem, key)) {
        if (fastDeepEqual(oldRecordValue, newRecordValue)) {
          return acc;
        }
      } else if (deepEqual(oldRecordValue, newRecordValue)) {
        return acc;
      }

      acc[key] = { before: oldRecordValue, after: newRecordValue };

      return acc;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as Record<string, { before: any; after: any }>,
  );
};
