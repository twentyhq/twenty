import { useRecoilState } from 'recoil';

import { useUpdateEntityField } from '@/people/hooks/useUpdateEntityField';
import { InplaceInputTextEditMode } from '@/ui/inplace-input/components/InplaceInputTextEditMode';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

type OwnProps = {
  fieldName: string;
  viewFieldId: string;
  placeholder?: string;
};

export function GenericEditableTextCellEditMode({
  fieldName,
  viewFieldId,
  placeholder,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleSubmit(newText: string) {
    if (newText === fieldValue) return;

    setFieldValue(newText);

    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, viewFieldId, newText);
    }
  }

  return (
    <InplaceInputTextEditMode
      placeholder={placeholder ?? ''}
      autoFocus
      value={fieldValue ?? ''}
      onSubmit={handleSubmit}
    />
  );
}
