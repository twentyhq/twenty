import { IconComponent } from '@/ui/Display/Icon/types/IconComponent';
import { FloatingIconButton } from '@/ui/Input/Button/components/FloatingIconButton';

import { useInlineCell } from '../hooks/useInlineCell';

export const InlineCellButton = ({ Icon }: { Icon: IconComponent }) => {
  const { openInlineCell } = useInlineCell();

  const handleClick = () => {
    openInlineCell();
  };

  return (
    <FloatingIconButton
      size="small"
      onClick={handleClick}
      Icon={Icon}
      data-testid="inline-cell-edit-mode-container"
    />
  );
};
