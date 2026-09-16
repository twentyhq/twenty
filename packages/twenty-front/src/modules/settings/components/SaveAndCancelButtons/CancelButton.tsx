import { BUTTON_INVERTED_CLASS_NAME } from '@/ui/input/styles/ButtonInvertedClassName';
import { useLingui } from '@lingui/react/macro';
import { LightButton } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';

type CancelButtonProps = {
  onCancel?: () => void;
  disabled?: boolean;
  inverted?: boolean;
};

export const CancelButton = ({
  onCancel,
  disabled = false,
  inverted = false,
}: CancelButtonProps) => {
  const { t } = useLingui();

  if (inverted) {
    return (
      <Button
        className={BUTTON_INVERTED_CLASS_NAME}
        size="sm"
        onClick={onCancel}
        disabled={disabled}
        variant="ghost"
      >{t`Cancel`}</Button>
    );
  }

  return (
    <LightButton
      emphasis="subtle"
      onClick={onCancel}
      disabled={disabled}
    >{t`Cancel`}</LightButton>
  );
};
