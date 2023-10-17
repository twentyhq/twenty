import { Button } from '@/ui/input/button/components/Button';

type CancelButtonProps = {
  onCancel?: () => void;
};

export const CancelButton = ({ onCancel }: CancelButtonProps) => {
  return (
    <Button title="Cancel" variant="tertiary" onClick={onCancel} size="small" />
  );
};
