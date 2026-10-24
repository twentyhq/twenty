import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components/input';
import { IconFilter } from 'twenty-ui/icon';

type CoreObjectFilterButtonProps = {
  isFilterActive: boolean;
  onClick: () => void;
};

export const CoreObjectFilterButton = ({
  isFilterActive,
  onClick,
}: CoreObjectFilterButtonProps) => {
  const { t } = useLingui();

  return (
    <IconButton
      variant="outline"
      color={isFilterActive ? 'accent' : 'neutral'}
      size="sm"
      aria-label={t`Filter`}
      onClick={onClick}
    >
      <IconFilter />
    </IconButton>
  );
};
