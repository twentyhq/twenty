import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import {
  ON_DEMAND_FIELD_STORY_DEFINITION,
  ON_DEMAND_FIELD_STORY_EDITABLE_DEFINITION,
  ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA,
  ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
  ON_DEMAND_FIELD_STORY_RECORD_ID,
  seedOnDemandFieldStory,
} from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type FieldJsonValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type RecordIndexContextValue } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordListRowWidthComponentState } from '@/object-record/record-list/states/recordListRowWidthComponentState';
import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';

const NAME_METADATA = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
  fieldName: 'name',
});

const STATUS_METADATA = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
  fieldName: 'status',
});
const STATUS_RECORD_FIELD = {
  id: 'status-record-field',
  fieldMetadataItemId: STATUS_METADATA.id,
  position: 2,
  isVisible: true,
  size: 100,
};

const TRANSCRIPT_RECORD_FIELD = {
  id: 'transcript-record-field',
  fieldMetadataItemId: ON_DEMAND_FIELD_STORY_DEFINITION.fieldMetadataId,
  position: 1,
  isVisible: true,
  size: 100,
};
const NAME_RECORD_FIELD = {
  id: 'name-record-field',
  fieldMetadataItemId: NAME_METADATA.id,
  position: 0,
  isVisible: true,
  size: 200,
};
export const ON_DEMAND_FIELD_STORY_RECORD_FIELDS = [
  NAME_RECORD_FIELD,
  TRANSCRIPT_RECORD_FIELD,
  STATUS_RECORD_FIELD,
];

export const ON_DEMAND_FIELD_STORY_INDEX_CONTEXT: RecordIndexContextValue = {
  objectMetadataItem: ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
  objectNameSingular: 'callRecording',
  objectNamePlural: 'callRecordings',
  recordIndexId: 'on-demand-story',
  viewBarInstanceId: 'on-demand-story',
  indexIdentifierUrl: () => '',
  onIndexRecordsLoaded: () => {},
  isOnDemandFieldsEnabled: true,
  objectPermissionsByObjectMetadataId: {},
  labelIdentifierFieldMetadataItem:
    ON_DEMAND_FIELD_STORY_OBJECT_METADATA.fields.find(
      (field) =>
        field.id ===
        ON_DEMAND_FIELD_STORY_OBJECT_METADATA.labelIdentifierFieldMetadataId,
    ),
  recordFieldByFieldMetadataItemId: {
    [NAME_METADATA.id]: NAME_RECORD_FIELD,
    [STATUS_METADATA.id]: STATUS_RECORD_FIELD,
    [TRANSCRIPT_RECORD_FIELD.fieldMetadataItemId]: TRANSCRIPT_RECORD_FIELD,
  },
  fieldDefinitionByFieldMetadataItemId: {
    [STATUS_METADATA.id]: formatFieldMetadataItemAsColumnDefinition({
      field: STATUS_METADATA,
      objectMetadataItem: ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
      position: 2,
    }),
    [NAME_METADATA.id]: formatFieldMetadataItemAsColumnDefinition({
      field: NAME_METADATA,
      objectMetadataItem: ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
      position: 0,
    }),
    [TRANSCRIPT_RECORD_FIELD.fieldMetadataItemId]:
      ON_DEMAND_FIELD_STORY_DEFINITION,
  },
  fieldMetadataItemByFieldMetadataItemId: Object.fromEntries(
    ON_DEMAND_FIELD_STORY_OBJECT_METADATA.fields.map((field) => [
      field.id,
      field,
    ]),
  ),
};

export const ON_DEMAND_FIELD_STORY_EDITABLE_INDEX_CONTEXT: RecordIndexContextValue =
  {
    ...ON_DEMAND_FIELD_STORY_INDEX_CONTEXT,
    objectMetadataItem: ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA,
    fieldDefinitionByFieldMetadataItemId: {
      ...ON_DEMAND_FIELD_STORY_INDEX_CONTEXT.fieldDefinitionByFieldMetadataItemId,
      [ON_DEMAND_FIELD_STORY_EDITABLE_DEFINITION.fieldMetadataId]:
        ON_DEMAND_FIELD_STORY_EDITABLE_DEFINITION,
    },
    fieldMetadataItemByFieldMetadataItemId: Object.fromEntries(
      ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA.fields.map((field) => [
        field.id,
        field,
      ]),
    ),
  };

export const seedOnDemandCollectionFieldStory = (
  options: {
    value?: FieldJsonValue;
    isEditable?: boolean;
    isRecordSeedingEnabled?: boolean;
  } = {},
) => {
  seedOnDemandFieldStory(options);

  jotaiStore.set(
    currentRecordFieldsComponentState.atomFamily({
      instanceId: 'on-demand-story',
    }),
    ON_DEMAND_FIELD_STORY_RECORD_FIELDS,
  );
  jotaiStore.set(
    isRecordTableCheckboxColumnHiddenComponentState.atomFamily({
      instanceId: 'on-demand-story',
    }),
    true,
  );
  jotaiStore.set(
    isRecordTableDragColumnHiddenComponentState.atomFamily({
      instanceId: 'on-demand-story',
    }),
    true,
  );
  jotaiStore.set(
    recordListRowWidthComponentState.atomFamily({
      instanceId: 'on-demand-story',
    }),
    600,
  );
  jotaiStore.set(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: 'on-demand-story',
    }),
    ON_DEMAND_FIELD_STORY_OBJECT_METADATA.id,
  );
  if (options.isRecordSeedingEnabled === false) {
    return;
  }

  jotaiStore.set(
    recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
      instanceId: 'on-demand-story',
      familyKey: NO_RECORD_GROUP_FAMILY_KEY,
    }),
    [ON_DEMAND_FIELD_STORY_RECORD_ID],
  );
};
