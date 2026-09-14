import { BUTTON_SUBTLE_CLASS_NAME } from '@/ui/input/styles/ButtonSubtleClassName';
import { BUTTON_INVERTED_CLASS_NAME } from '@/ui/input/styles/ButtonInvertedClassName';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';

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
    <Button
      className={BUTTON_SUBTLE_CLASS_NAME}
      onClick={onCancel}
      disabled={disabled}
      size="sm"
      variant="ghost"
    >{t`Cancel`}</Button>
  );
};
