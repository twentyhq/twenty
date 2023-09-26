import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useEditableField } from '@/ui/editable-field/hooks/useEditableField';
import { ProbabilityInput } from '@/ui/input/components/ProbabilityInput';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldProbabilityMetadata } from '../types/FieldMetadata';

export const ProbabilityEditableFieldEditMode = () => {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldProbabilityMetadata>;

  const [fieldValue, setFieldValue] = useRecoilState<number>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const { closeEditableField } = useEditableField();

  const updateField = useUpdateGenericEntityField();

  const probabilityIndex = Math.ceil(fieldValue / 25);

  const handleChange = (newValue: number) => {
    setFieldValue(newValue);
    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        newValue,
      );
    }
    closeEditableField();
  };

  return (
    <ProbabilityInput
      probabilityIndex={probabilityIndex}
      onChange={handleChange}
    />
  );
};
