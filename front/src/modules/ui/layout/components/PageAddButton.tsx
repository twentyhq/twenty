import { IconButton } from '@/ui/button/components/IconButton';
import { IconPlus } from '@/ui/icon';

type OwnProps = {
  onClick: () => void;
};

export const PageAddButton = ({ onClick }: OwnProps) => (
  <IconButton
    Icon={IconPlus}
    dataTestId="add-button"
    size="medium"
    variant="secondary"
    accent="default"
    onClick={onClick}
  />
);
