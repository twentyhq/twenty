import { t } from '@lingui/core/macro';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useMorphPersistManyToOne } from '@/object-record/record-field/ui/meta-types/input/hooks/useMorphPersistManyToOne';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconForbid } from 'twenty-ui/display';

export const MorphRelationManyToOneFieldInput = () => {
  const { fieldDefinition, recordId } = useContext(FieldContext);

  const { onCancel } = useContext(FieldInputEventContext);
  const { objectMetadataItems } = useObjectMetadataItems();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const { persistMorphManyToOne } = useMorphPersistManyToOne({
    objectMetadataNameSingular:
      fieldDefinition.metadata.objectMetadataNameSingular ?? '',
  });

  const handleMorphItemSelected = async (
    selectedMorphItem: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    if (!isDefined(selectedMorphItem)) {
      // Handle detach
      return;
    }

    const targetObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === selectedMorphItem.objectMetadataId,
    );

    if (!isDefined(targetObjectMetadataItem)) {
      throw new Error('TargetObjectMetadataItem is required');
    }

    await persistMorphManyToOne({
      recordId: recordId,
      fieldDefinition,
      valueToPersist: selectedMorphItem.recordId,
      targetObjectMetadataNameSingular: targetObjectMetadataItem.nameSingular,
    });
    onCancel?.();
  };

  const layoutDirection = useRecoilComponentValue(
    recordFieldInputLayoutDirectionComponentState,
  );

  const isLoading = useRecoilComponentValue(
    recordFieldInputLayoutDirectionLoadingComponentState,
  );

  if (isLoading) {
    return <></>;
  }

  if (!isFieldMorphRelationManyToOne(fieldDefinition)) {
    return null;
  }
  const objectNameSingulars = fieldDefinition.metadata.morphRelations.map(
    (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
  );

  const fieldLabel = fieldDefinition.label;

  return (
    <SingleRecordPicker
      focusId={instanceId}
      componentInstanceId={instanceId}
      EmptyIcon={IconForbid}
      emptyLabel={t`No ${fieldLabel}`}
      onCancel={onCancel}
      onMorphItemSelected={handleMorphItemSelected}
      objectNameSingulars={objectNameSingulars}
      recordPickerInstanceId={instanceId}
      layoutDirection={
        layoutDirection === 'downward'
          ? 'search-bar-on-top'
          : 'search-bar-on-bottom'
      }
      dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
    />
  );
};
