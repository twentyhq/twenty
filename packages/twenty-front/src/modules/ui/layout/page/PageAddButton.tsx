import { IconPlus } from 'twenty-ui';

import { IconButton } from '@/ui/input/button/components/IconButton';

type PageAddButtonProps = {
  onClick: () => void;
};

export const PageAddButton = ({ onClick }: PageAddButtonProps) => (
  <IconButton
    Icon={IconPlus}
    dataTestId="add-button"
    size="medium"
    variant="secondary"
    accent="default"
    onClick={onClick}
    ariaLabel="Add"
  />
);
