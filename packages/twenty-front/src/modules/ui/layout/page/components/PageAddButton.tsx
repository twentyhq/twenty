import { Button, IconPlus } from 'twenty-ui';

type PageAddButtonProps = {
  onClick?: () => void;
};

export const PageAddButton = ({ onClick }: PageAddButtonProps) => (
  <Button
    Icon={IconPlus}
    dataTestId="add-button"
    size="small"
    variant="secondary"
    accent="default"
    title="New record"
    onClick={onClick}
    ariaLabel="New record"
  />
);
