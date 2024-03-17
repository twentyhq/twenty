import { IconButton } from 'twenty-ui';

import { IconPlus } from '@/ui/display/icon';

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
