import { useLingui } from '@lingui/react/macro';
import { LightButton } from 'twenty-ui/input';

type CancelButtonProps = {
  onCancel?: () => void;
  disabled?: boolean;
};

export const CancelButton = ({
  onCancel,
  disabled = false,
}: CancelButtonProps) => {
  const { t } = useLingui();
  return (
    <LightButton
      title={t`Cancel`}
      accent="tertiary"
      onClick={onCancel}
      disabled={disabled}
    />
  );
};
