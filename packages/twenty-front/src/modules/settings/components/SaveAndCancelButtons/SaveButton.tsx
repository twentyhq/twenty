import { IconDeviceFloppy } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';

type SaveButtonProps = {
  onSave?: () => void;
  disabled?: boolean;
};

export const SaveButton = ({ onSave, disabled }: SaveButtonProps) => {
  return (
    <Button
      title="Save"
      variant="primary"
      size="small"
      accent="blue"
      disabled={disabled}
      onClick={onSave}
      Icon={IconDeviceFloppy}
    />
  );
};
