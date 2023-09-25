import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { ProbabilityInput } from '@/ui/input/components/ProbabilityInput';

import { FieldDefinition } from '../../field/types/FieldDefinition';
import { FieldProbabilityMetadata } from '../../field/types/FieldMetadata';
import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useInlineCell } from '../hooks/useEditableField';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';

export const ProbabilityEditableFieldEditMode = () => {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldProbabilityMetadata>;

  const [fieldValue, setFieldValue] = useRecoilState<number>(
    entityFieldsFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const { closeEditableField } = useInlineCell();

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
