import { useRecoilState } from 'recoil';

import {
  ViewFieldDefinition,
  ViewFieldEmailMetadata,
} from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { TextCellEdit } from './TextCellEdit';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldEmailMetadata>;
};

export function GenericEditableEmailCellEditMode({ viewField }: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newEmail: string) {
    if (newEmail === fieldValue) return;

    setFieldValue(newEmail);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, viewField, newEmail);
    }
  }

  return (
    <TextCellEdit
      placeholder={viewField.metadata.placeHolder ?? ''}
      autoFocus
      value={fieldValue ?? ''}
      onSubmit={handleSubmit}
    />
  );
}
