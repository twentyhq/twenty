import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { EditableFieldContext } from '../states/EditableFieldContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldDateMetadata } from '../types/FieldMetadata';
import { EditableFieldEditModeDate } from '../variants/components/EditableFieldEditModeDate';

export function GenericEditableDateFieldEditMode() {
  const currentEditableField = useContext(EditableFieldContext);
  const currentEditableFieldEntityId = currentEditableField.entityId;
  const currentEditableFieldDefinition =
    currentEditableField.fieldDefinition as FieldDefinition<FieldDateMetadata>;

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

  function handleSubmit(newDateISO: string) {
    if (newDateISO === fieldValue || !newDateISO) return;

    setFieldValue(newDateISO);

    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        newDateISO,
      );
    }
  }

  return (
    <EditableFieldEditModeDate value={fieldValue} onChange={handleSubmit} />
  );
}
