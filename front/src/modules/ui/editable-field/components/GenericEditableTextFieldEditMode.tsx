import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { TextInput } from '@/ui/input/components/TextInput';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useFieldInputEventHandlers } from '../hooks/useFieldInputEventHandlers';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { EditableFieldHotkeyScope } from '../types/EditableFieldHotkeyScope';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldTextMetadata } from '../types/FieldMetadata';

export const GenericEditableTextFieldEditMode = () => {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldTextMetadata>;

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

  const handleSubmit = (newValue: string) => {
    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        newValue,
      );

      // TODO: use optimistic effect instead, but needs generic refactor
      setFieldValue(newValue);
    }
  };

  const { handleEnter, handleEscape, handleClickOutside } =
    useFieldInputEventHandlers({
      onSubmit: handleSubmit,
    });

  return (
    <TextInput
      placeholder={currentEditableFieldDefinition.metadata.placeHolder}
      autoFocus
      value={fieldValue ?? ''}
      onClickOutside={handleClickOutside}
      onEnter={handleEnter}
      onEscape={handleEscape}
      hotkeyScope={EditableFieldHotkeyScope.EditableField}
    />
  );
};
