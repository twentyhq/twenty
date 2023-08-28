import { useRecoilState } from 'recoil';

import type { ViewFieldPhoneMetadata } from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

import { PhoneCellEdit } from './PhoneCellEdit';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldPhoneMetadata>;
};

export function GenericEditablePhoneCellEditMode({
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

  function handleSubmit(newText: string) {
    if (newText === fieldValue) return;

    setFieldValue(newText);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, fieldDefinition, newText);
    }
  }

  return (
    <PhoneCellEdit
      placeholder={fieldDefinition.metadata.placeHolder ?? ''}
      autoFocus
      value={fieldValue ?? ''}
      onSubmit={handleSubmit}
    />
  );
}
