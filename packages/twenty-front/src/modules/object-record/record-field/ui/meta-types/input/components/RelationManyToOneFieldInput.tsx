import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useRelationField } from '@/object-record/record-field/ui/meta-types/hooks/useRelationField';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/record-field/ui/meta-types/input/hooks/useAddNewRecordAndOpenRightDrawer';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
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
  if (!fieldMetadataItem || !objectMetadataItem) {
    throw new CustomError(
      'Field metadata item or object metadata item not found',
      'FIELD_METADATA_ITEM_OR_OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }
  const { onSubmit, onCancel } = useContext(FieldInputEventContext);

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleMorphItemSelected = (
    selectedMorphItem: RecordPickerPickableMorphItem | null | undefined,
  ) =>
    onSubmit?.({
      newValue: isDefined(selectedMorphItem)
        ? { id: selectedMorphItem.recordId }
        : null,
    });

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

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      fieldMetadataItem,
      objectMetadataItem,
      relationObjectMetadataNameSingular:
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  const layoutDirection = useRecoilComponentValue(
    recordFieldInputLayoutDirectionComponentState,
  );

  const isLoading = useRecoilComponentValue(
    recordFieldInputLayoutDirectionLoadingComponentState,
  );

  const setSingleRecordPickerSelectedId = useSetRecoilComponentState(
    singleRecordPickerSelectedIdComponentState,
    instanceId,
  );

  const handleCreateNew = async (searchInput?: string) => {
    const newRecordId = await createNewRecordAndOpenRightDrawer?.(searchInput);

    if (isDefined(newRecordId)) {
      setSingleRecordPickerSelectedId(newRecordId);
    }
  };

  if (isLoading) {
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
      onCreate={handleCreateNew}
      onMorphItemSelected={handleMorphItemSelected}
      objectNameSingulars={[
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      ]}
      recordPickerInstanceId={instanceId}
      layoutDirection={
        layoutDirection === 'downward'
          ? 'search-bar-on-top'
          : 'search-bar-on-bottom'
      }
    />
  );
};
