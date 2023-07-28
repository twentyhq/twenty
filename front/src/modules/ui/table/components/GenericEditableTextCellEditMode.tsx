import { useRecoilState } from 'recoil';

import { useUpdateEntityField } from '@/people/hooks/useUpdateEntityField';
import { InplaceInputTextEditMode } from '@/ui/inplace-input/components/InplaceInputTextEditMode';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';

type OwnProps = {
  fieldName: string;
  placeholder?: string;
};

export function GenericEditableTextCellEditMode({
  fieldName,
  placeholder,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

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
      updateField(currentRowEntityId, fieldName, newText);
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
