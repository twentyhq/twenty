import { IconButton } from '@/ui/button/components/IconButton';
import { IconPencil } from '@/ui/icon';

import { useEditableField } from '../hooks/useEditableField';

export function EditableFieldEditButton() {
  const { openEditableField } = useEditableField();

  function handleClick() {
    openEditableField();
  }

  return (
    <IconButton
      variant="shadow"
      size="small"
      onClick={handleClick}
      icon={<IconPencil size={14} />}
      data-testid="editable-field-edit-mode-container"
    />
  );
}
