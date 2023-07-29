import { useRecoilState } from 'recoil';

import { InplaceInputTextCellEditMode } from '@/ui/inplace-input/components/InplaceInputTextCellEditMode';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

import { ViewFieldDefinition, ViewFieldURLMetadata } from '../types/ViewField';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldURLMetadata>;
};

export function GenericEditableURLCellEditMode({ viewField }: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newText: string) {
    if (newText === fieldValue) return;

    setFieldValue(newText);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, viewField, newText);
    }
  }

  return (
    <InplaceInputTextCellEditMode
      placeholder={viewField.metadata.placeHolder ?? ''}
      autoFocus
      value={fieldValue ?? ''}
      onSubmit={handleSubmit}
    />
  );
}
