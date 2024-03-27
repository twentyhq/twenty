import { FloatingIconButton, IconComponent } from 'twenty-ui';

export const RecordInlineCellButton = ({ Icon }: { Icon: IconComponent }) => {
  return (
    <FloatingIconButton
      size="small"
      Icon={Icon}
      data-testid="inline-cell-edit-mode-container"
    />
  );
};
