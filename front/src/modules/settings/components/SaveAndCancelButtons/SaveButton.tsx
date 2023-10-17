import { Button } from '@/ui/input/button/components/Button';
import { IconDeviceFloppy } from '@/ui/input/constants/icons';

type SaveButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export const SaveButton = ({ onClick, disabled }: SaveButtonProps) => {
  return (
    <Button
      title="Save"
      variant="primary"
      accent="blue"
      disabled={disabled}
      onClick={onClick}
      Icon={IconDeviceFloppy}
    />
  );
};
