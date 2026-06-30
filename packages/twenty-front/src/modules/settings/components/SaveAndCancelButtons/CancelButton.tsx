import { useLingui } from '@lingui/react/macro';
import { Button, LightButton } from 'twenty-ui/input';

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
        title={t`Cancel`}
        variant="tertiary"
        accent="default"
        inverted
        size="small"
        onClick={onCancel}
        disabled={disabled}
      />
    );
  }

  return (
    <LightButton
      title={t`Cancel`}
      accent="tertiary"
      onClick={onCancel}
      disabled={disabled}
    />
  );
};
