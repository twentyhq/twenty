import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
import { IconPencil } from '@/ui/icon';

import { useEditableField } from '../hooks/useEditableField';

export function EditableFieldEditButton() {
  const { openEditableField } = useEditableField();

  function handleClick() {
    openEditableField();
  }

  return (
    <FloatingIconButton
      size="small"
      onClick={handleClick}
      Icon={IconPencil}
      data-testid="editable-field-edit-mode-container"
    />
  );
}
