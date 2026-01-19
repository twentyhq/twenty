import { t } from '@lingui/core/macro';

import { IconChevronDown } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';

type FieldWidgetShowMoreButtonProps = {
  remainingCount: number;
  onClick: () => void;
};

export const FieldWidgetShowMoreButton = ({
  remainingCount,
  onClick,
}: FieldWidgetShowMoreButtonProps) => {
  return (
    <LightButton
      title={t`More (${remainingCount})`}
      Icon={IconChevronDown}
      onClick={onClick}
      accent="tertiary"
    />
  );
};
