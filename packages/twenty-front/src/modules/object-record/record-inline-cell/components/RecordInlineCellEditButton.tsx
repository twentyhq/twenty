import { IconComponent } from 'twenty-ui';

import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';

export const RecordInlineCellButton = ({ Icon }: { Icon: IconComponent }) => {
  return (
    <FloatingIconButton
      size="small"
      Icon={Icon}
      data-testid="inline-cell-edit-mode-container"
    />
  );
};
