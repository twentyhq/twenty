import { useRecoilState } from 'recoil';

import type { ViewFieldEmailMetadata } from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { TextCellEdit } from './TextCellEdit';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldEmailMetadata>;
};

export function GenericEditableEmailCellEditMode({
  fieldDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newEmail: string) {
    if (newEmail === fieldValue) return;

    setFieldValue(newEmail);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, fieldDefinition, newEmail);
    }
  }

  return (
    <TextCellEdit
      placeholder={fieldDefinition.metadata.placeHolder ?? ''}
      autoFocus
      value={fieldValue ?? ''}
      onSubmit={handleSubmit}
    />
  );
}
