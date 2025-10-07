import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { IconForbid } from 'twenty-ui/display';

export const MorphRelationManyToOneFieldInput = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const { onCancel, onSubmit } = useContext(FieldInputEventContext);
  const { onCloseTableCell } = useRecordTableBodyContextOrThrow();

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const handleMorphItemSelected = (
    selectedMorphItem: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    onSubmit?.({ newValue: selectedMorphItem?.recordId ?? null });
    onCloseTableCell();
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

  return (
    <SingleRecordPicker
      focusId={instanceId}
      componentInstanceId={instanceId}
      EmptyIcon={IconForbid}
      emptyLabel={'No ' + fieldDefinition.label}
      onCancel={onCancel}
      onMorphItemSelected={handleMorphItemSelected}
      objectNameSingulars={objectNameSingulars}
      recordPickerInstanceId={instanceId}
      layoutDirection={
        layoutDirection === 'downward'
          ? 'search-bar-on-top'
          : 'search-bar-on-bottom'
      }
    />
  );
};
