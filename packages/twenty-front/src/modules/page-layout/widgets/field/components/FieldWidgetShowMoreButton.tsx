import { LightButton } from 'twenty-ui/components/input';
import { IconChevronDown } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

type FieldWidgetShowMoreButtonProps = {
  remainingCount: number;
  onClick: () => void;
};

export const FieldWidgetShowMoreButton = ({
  remainingCount,
  onClick,
}: FieldWidgetShowMoreButtonProps) => {
  const { t } = useLingui();
  return (
    <LightButton
      emphasis="subtle"
      size="sm"
      startIcon={<IconChevronDown />}
      data-testid="field-widget-show-more-button"
      onClick={onClick}
    >
      {t`More (${remainingCount})`}
    </LightButton>
  );
};
