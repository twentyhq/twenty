import { useRecoilState } from 'recoil';

import { InplaceInputTextEditMode } from '@/ui/inplace-input/components/InplaceInputTextEditMode';
import { useEntityUpdateFieldHook } from '@/ui/table/hooks/useCellUpdateFieldHook';
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

  const useUpdateField = useEntityUpdateFieldHook();
  const updateField = useUpdateField?.();

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
