import { useContext } from 'react';

import { GenericFieldDisplay } from '@/ui/field/components/GenericFieldDisplay';
import { GenericFieldInput } from '@/ui/field/components/GenericFieldInput';
import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { useIsFieldEmpty } from '@/ui/field/hooks/useField';
import { isFieldRelation } from '@/ui/field/types/guards/isFieldRelation';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';

import { EditableField } from './EditableField';

export const InlineCell = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const isFieldEmpty = useIsFieldEmpty();

  return (
    <EditableField
      useEditButton={fieldDefinition.useEditButton}
      customEditHotkeyScope={
        isFieldRelation(fieldDefinition)
          ? {
              scope: RelationPickerHotkeyScope.RelationPicker,
            }
          : undefined
      }
      IconLabel={fieldDefinition.Icon}
      editModeContent={<GenericFieldInput />}
      displayModeContent={<GenericFieldDisplay />}
      isDisplayModeContentEmpty={isFieldEmpty}
      isDisplayModeFixHeight
    />
  );
};
