import { FloatingIconButton } from 'twenty-ui';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

export const RecordInlineCellButton = ({ Icon }: { Icon: IconComponent }) => {
  return (
    <FloatingIconButton
      size="small"
      Icon={Icon}
      data-testid="inline-cell-edit-mode-container"
    />
  );
};
