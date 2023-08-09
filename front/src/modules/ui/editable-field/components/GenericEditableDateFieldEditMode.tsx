import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
} from '@/ui/editable-field/types/ViewField';

import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { EditableFieldEntityIdContext } from '../states/EditableFieldEntityIdContext';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { EditableFieldEditModeDate } from '../variants/components/EditableFieldEditModeDate';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDateMetadata>;
};

export function GenericEditableDateFieldEditMode({ viewField }: OwnProps) {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

  function handleSubmit(newDateISO: string) {
    if (newDateISO === fieldValue || !newDateISO) return;

    setFieldValue(newDateISO);

    if (currentEditableFieldEntityId && updateField && newDateISO) {
      updateField(currentEditableFieldEntityId, viewField, newDateISO);
    }
  }

  return (
    <EditableFieldEditModeDate value={fieldValue} onChange={handleSubmit} />
  );
}
