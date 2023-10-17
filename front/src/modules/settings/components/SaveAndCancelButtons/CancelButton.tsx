import { LightButton } from '@/ui/input/button/components/LightButton';

type CancelButtonProps = {
  onCancel?: () => void;
};

export const CancelButton = ({ onCancel }: CancelButtonProps) => {
  return <LightButton title="Cancel" accent="tertiary" onClick={onCancel} />;
};
