import { useContext } from 'react';

import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useUpdateMorphRelationOneToManyFieldInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useUpdateMorphRelationOneToManyFieldInput';
import { FieldInputDropdown } from '@/object-record/record-field/ui/meta-types/input/components/FieldInputDropdown';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const MorphRelationOneToManyFieldInput = () => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const { onSubmit } = useContext(FieldInputEventContext);

  const { updateMorphRelationOneToMany } =
    useUpdateMorphRelationOneToManyFieldInput();

  const handleSubmit = () => {
    onSubmit?.({ skipPersist: true });
  };

  return (
    <FieldInputDropdown
      onDismiss={handleSubmit}
      width={GenericDropdownContentWidth.ExtraLarge}
      multiple
      shouldSkipPersist
      shouldDismissOnOutsideInput
    >
      <MultipleRecordPicker
        componentInstanceId={instanceId}
        onChange={updateMorphRelationOneToMany}
      />
    </FieldInputDropdown>
  );
};
