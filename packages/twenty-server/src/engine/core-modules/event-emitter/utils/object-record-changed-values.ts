import deepEqual from 'deep-equal';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const isWorkflowVersionStepsOrTrigger = (
  objectMetadataItem: FlatObjectMetadata,
  key: string,
) => {
  return (
    objectMetadataItem.standardId === STANDARD_OBJECT_IDS.workflowVersion &&
    (key === 'steps' || key === 'trigger')
  );
};

const isWorkflowAutomatedTriggerSettings = (
  objectMetadataItem: Pick<FlatObjectMetadata, 'standardId'>,
  key: string,
) => {
  return (
    objectMetadataItem.standardId ===
      STANDARD_OBJECT_IDS.workflowAutomatedTrigger && key === 'settings'
  );
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

      // Temporary ignore workflow json fields changes
      if (
        isWorkflowAutomatedTriggerSettings(objectMetadataItem, key) ||
        isWorkflowVersionStepsOrTrigger(objectMetadataItem, key)
      ) {
        return acc;
      }

      if (
        key === 'updatedAt' ||
        key === 'searchVector' ||
        field?.type === FieldMetadataType.RELATION ||
        deepEqual(oldRecordValue, newRecordValue)
      ) {
        return acc;
      }

      acc[key] = { before: oldRecordValue, after: newRecordValue };

      return acc;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as Record<string, { before: any; after: any }>,
  );
};
