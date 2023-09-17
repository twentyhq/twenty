import { IconButton } from '@/ui/button/components/IconButton';
import { IconPlus } from '@/ui/icon';

type OwnProps = {
  onClick: () => void;
};

export const PageAddButton = ({ onClick }: OwnProps) => (
  <IconButton
    Icon={IconPlus}
    size="medium"
    variant="secondary"
    data-testid="add-button"
    accent="default"
    onClick={onClick}
  />
);
