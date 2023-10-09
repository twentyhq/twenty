import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
import { IconComponent } from '@/ui/icon/types/IconComponent';

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
