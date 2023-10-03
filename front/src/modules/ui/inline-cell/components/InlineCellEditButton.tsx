import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
import { IconPencil } from '@/ui/icon';

import { useInlineCell } from '../hooks/useInlineCell';

export const InlineCellEditButton = () => {
  const { openInlineCell } = useInlineCell();

  const handleClick = () => {
    openInlineCell();
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
