import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { DateInput } from '@/ui/input/components/DateInput';
import { Nullable } from '~/types/Nullable';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useFieldInputEventHandlers } from '../hooks/useFieldInputEventHandlers';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { EditableFieldHotkeyScope } from '../types/EditableFieldHotkeyScope';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldDateMetadata } from '../types/FieldMetadata';

export const GenericEditableDateFieldEditMode = () => {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldDateMetadata>;

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const updateField = useUpdateGenericEntityField();

  const handleSubmit = (newDate: Nullable<Date>) => {
    if (!newDate) {
      setFieldValue('');

      if (currentEditableFieldEntityId && updateField) {
        updateField(
          currentEditableFieldEntityId,
          currentEditableFieldDefinition,
          '',
        );
      }
    }

    const newDateISO = newDate?.toISOString();

    if (newDateISO === fieldValue || !newDateISO) return;

    setFieldValue(newDateISO);

    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        newDateISO,
      );
    }
  };

  const { handleEnter, handleEscape, handleClickOutside } =
    useFieldInputEventHandlers({
      onSubmit: handleSubmit,
    });

  return (
    <DateInput
      hotkeyScope={EditableFieldHotkeyScope.EditableField}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      value={fieldValue ? new Date(fieldValue) : null}
    />
  );
};
