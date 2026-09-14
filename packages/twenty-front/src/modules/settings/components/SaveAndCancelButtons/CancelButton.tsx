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
        size="sm"
        onClick={onCancel}
        disabled={disabled}
        variant="ghost"
        style={{ color: 'var(--t-font-color-inverted)' }}
      >{t`Cancel`}</Button>
    );
  }

  return (
    <Button
      onClick={onCancel}
      disabled={disabled}
      size="sm"
      variant="ghost"
      style={{
        fontWeight: 'var(--t-font-weight-regular)',
        color: 'var(--t-font-color-tertiary)',
      }}
    >{t`Cancel`}</Button>
  );
};
