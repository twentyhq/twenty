import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useRelationField } from '@/object-record/record-field/ui/meta-types/hooks/useRelationField';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useAddNewRecordAndOpenSidePanel } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenSidePanel';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useContext } from 'react';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { IconForbid } from 'twenty-ui/display';

export const RelationManyToOneFieldInput = () => {
  const { t } = useLingui();
  const { fieldDefinition, recordId } = useRelationField<ObjectRecord>();

  const { objectMetadataItems } = useObjectMetadataItems();
  const { fieldMetadataItem, objectMetadataItem } = getFieldMetadataItemById({
    fieldMetadataId: fieldDefinition.fieldMetadataId,
    objectMetadataItems,
  });
  if (!isDefined(fieldMetadataItem) || !isDefined(objectMetadataItem)) {
    throw new CustomError(
      'Field metadata item or object metadata item not found',
      'FIELD_METADATA_ITEM_OR_OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }
  const { onSubmit, onCancel } = useContext(FieldInputEventContext);
  const store = useStore();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleMorphItemSelected = (
    selectedMorphItem: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    // Pre-store the picked record in the Jotai store so draft persistence
    // can read the full record (with name/label) instead of just { id }.
    if (isDefined(selectedMorphItem)) {
      const existingRecord = store.get(
        recordStoreFamilyState.atomFamily(selectedMorphItem.recordId),
      );
      if (!isDefined(existingRecord)) {
        const searchRecord = store.get(
          searchRecordStoreFamilyState.atomFamily(selectedMorphItem.recordId),
        );
        store.set(
          recordStoreFamilyState.atomFamily(selectedMorphItem.recordId),
          {
            id: selectedMorphItem.recordId,
            name: searchRecord?.label ?? '',
          } as unknown as ObjectRecord,
        );
      }
    }

    onSubmit?.({
      newValue: isDefined(selectedMorphItem)
        ? { id: selectedMorphItem.recordId }
        : null,
    });
  };

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === fieldDefinition.metadata.relationFieldMetadataId,
  );
  if (!relationFieldMetadataItem) {
    throw new CustomError(
      'Relation field metadata item not found',
      'RELATION_FIELD_METADATA_ITEM_NOT_FOUND',
    );
  }

  const { createNewRecordAndOpenSidePanel } = useAddNewRecordAndOpenSidePanel({
    fieldMetadataItem,
    objectMetadataItem,
    relationObjectMetadataNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
    relationObjectMetadataItem,
    relationFieldMetadataItem,
    recordId,
  });

  const recordFieldInputLayoutDirection = useAtomComponentStateValue(
    recordFieldInputLayoutDirectionComponentState,
  );

  const recordFieldInputLayoutDirectionLoading = useAtomComponentStateValue(
    recordFieldInputLayoutDirectionLoadingComponentState,
    instanceId,
  );

  const setSingleRecordPickerSelectedId = useSetAtomComponentState(
    singleRecordPickerSelectedIdComponentState,
    instanceId,
  );

  const handleCreateNew = (searchInput?: string) => {
    createNewRecordAndOpenSidePanel?.(searchInput);
  };

  if (recordFieldInputLayoutDirectionLoading) {
    return <></>;
  }
  const fieldLabel = fieldDefinition.label;

  return (
    <SingleRecordPicker
      focusId={instanceId}
      componentInstanceId={instanceId}
      EmptyIcon={IconForbid}
      emptyLabel={t`No ${fieldLabel}`}
      onCancel={onCancel}
      onCreate={
        isDefined(createNewRecordAndOpenSidePanel) ? handleCreateNew : undefined
      }
      onMorphItemSelected={handleMorphItemSelected}
      objectNameSingulars={[
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      ]}
      recordPickerInstanceId={instanceId}
      layoutDirection={
        recordFieldInputLayoutDirection === 'downward'
          ? 'search-bar-on-top'
          : 'search-bar-on-bottom'
      }
    />
  );
};
