import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { TextInput } from '@/ui/input/components/TextInput';
import {
  canBeCastAsIntegerOrNull,
  castAsIntegerOrNull,
} from '~/utils/cast-as-integer-or-null';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useFieldInputEventHandlers } from '../hooks/useFieldInputEventHandlers';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { EditableFieldHotkeyScope } from '../types/EditableFieldHotkeyScope';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldNumberMetadata } from '../types/FieldMetadata';

export const GenericEditableNumberFieldEditMode = () => {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldNumberMetadata>;

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<number | null>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const updateField = useUpdateGenericEntityField();

  const handleSubmit = (newValue: string) => {
    if (!canBeCastAsIntegerOrNull(newValue)) {
      return;
    }

    if (newValue === fieldValue) return;

    const castedValue = castAsIntegerOrNull(newValue);

    setFieldValue(castedValue);

    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        castedValue,
      );
    }
  };

  const { handleEnter, handleEscape, handleClickOutside } =
    useFieldInputEventHandlers({
      onSubmit: handleSubmit,
    });

  return (
    <TextInput
      autoFocus
      placeholder={currentEditableFieldDefinition.metadata.placeHolder}
      hotkeyScope={EditableFieldHotkeyScope.EditableField}
      value={fieldValue ? fieldValue.toString() : ''}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
    />
  );
};
