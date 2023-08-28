import { useRecoilState } from 'recoil';

import type { ViewFieldURLMetadata } from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { isURL } from '~/utils/is-url';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { TextCellEdit } from './TextCellEdit';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldURLMetadata>;
};

export function GenericEditableURLCellEditMode({ fieldDefinition }: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newText: string) {
    if (newText === fieldValue) return;

    if (!isURL(newText)) return;

    setFieldValue(newText);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, fieldDefinition, newText);
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
