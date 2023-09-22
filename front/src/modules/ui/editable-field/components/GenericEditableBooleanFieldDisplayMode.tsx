import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { BooleanInput } from '@/ui/input/components/BooleanInput';

import { FieldDefinition } from '../../field/types/FieldDefinition';
import { FieldBooleanMetadata } from '../../field/types/FieldMetadata';
import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';

export const GenericEditableBooleanFieldDisplayMode = () => {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldBooleanMetadata>;

  const [fieldValue, setFieldValue] = useRecoilState<boolean>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const updateField = useUpdateGenericEntityField();

  const handleSubmit = (newValue: boolean) => {
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

  return <BooleanInput value={fieldValue} onToggle={handleSubmit} />;
};
