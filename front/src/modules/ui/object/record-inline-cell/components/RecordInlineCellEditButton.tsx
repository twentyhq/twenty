import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';

import { useInlineCell } from '../hooks/useInlineCell';

export const RecordInlineCellButton = ({ Icon }: { Icon: IconComponent }) => {
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
