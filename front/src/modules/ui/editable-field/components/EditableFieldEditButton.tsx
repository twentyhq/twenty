import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
import { IconPencil } from '@/ui/icon';

import { useInlineCell } from '../hooks/useEditableField';

export const EditableFieldEditButton = () => {
  const { openEditableField } = useInlineCell();

  const handleClick = () => {
    openEditableField();
  };

  return (
    <FloatingIconButton
      size="small"
      onClick={handleClick}
      Icon={IconPencil}
      data-testid="editable-field-edit-mode-container"
    />
  );
};
