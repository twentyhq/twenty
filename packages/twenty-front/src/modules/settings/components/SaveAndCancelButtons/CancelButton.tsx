import { LightButton } from '@/ui/input/button/components/LightButton';

type CancelButtonProps = {
  onCancel?: () => void;
  disabled?: boolean;
};

export const CancelButton = ({
  onCancel,
  disabled = false,
}: CancelButtonProps) => {
  return (
    <LightButton
      title="Cancel"
      accent="tertiary"
      onClick={onCancel}
      disabled={disabled}
    />
  );
};
