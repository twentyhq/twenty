import deepEqual from 'deep-equal';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';

import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

const isWorkflowVersionStepsOrTrigger = (
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  key: string,
) => {
  return (
    objectMetadataItem.standardId === STANDARD_OBJECT_IDS.workflowVersion &&
    (key === 'steps' || key === 'trigger')
  );
};

const isWorkflowRunState = (
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  key: string,
) => {
  return (
    objectMetadataItem.standardId === STANDARD_OBJECT_IDS.workflowRun &&
    key === 'state'
  );
};

const isWorkflowAutomatedTriggerSettings = (
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
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
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
) => {
  return Object.keys(newRecord).reduce(
    (acc, key) => {
      const field =
        objectMetadataItem.fieldsById[objectMetadataItem.fieldIdByName[key]];

      const oldRecordValue = oldRecord[key];
      const newRecordValue = newRecord[key];

      // Temporary ignore workflow json fields changes
      if (
        isWorkflowAutomatedTriggerSettings(objectMetadataItem, key) ||
        isWorkflowVersionStepsOrTrigger(objectMetadataItem, key) ||
        isWorkflowRunState(objectMetadataItem, key)
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
