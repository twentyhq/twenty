import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
import { IconPencil } from '@/ui/icon';

import { useInlineCell } from '../hooks/useInlineCell';

export const InlineCellEditButton = () => {
  const { openInlineCell: openEditableField } = useInlineCell();

  const handleClick = () => {
    openEditableField();
  };

  return (
    <FloatingIconButton
      size="small"
      onClick={handleClick}
      Icon={IconPencil}
      data-testid="inline-cell-edit-mode-container"
    />
  );
};
