import { useRecoilState } from 'recoil';

import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
} from '@/ui/editable-field/types/ViewField';

import { useCurrentEntityId } from '../hooks/useCurrentEntityId';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/genericEntityFieldFamilySelector';
import { EditableFieldEditModeDate } from '../variants/components/EditableFieldEditModeDate';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldDateMetadata>;
};

export function GenericEditableDateFieldEditMode({ viewField }: OwnProps) {
  const currentEntityId = useCurrentEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    genericEntityFieldFamilySelector({
      entityId: currentEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

  function handleSubmit(newDateISO: string) {
    if (newDateISO === fieldValue || !newDateISO) return;

    setFieldValue(newDateISO);

    if (currentEntityId && updateField && newDateISO) {
      updateField(currentEntityId, viewField, newDateISO);
    }
  }

  return (
    <EditableFieldEditModeDate value={fieldValue} onChange={handleSubmit} />
  );
}
