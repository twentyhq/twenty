import { t } from '@lingui/core/macro';
import { IconDeviceFloppy } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

type SaveButtonProps = {
  onSave?: () => void;
  disabled?: boolean;
};

export const SaveButton = ({ onSave, disabled }: SaveButtonProps) => {
  return (
    <Button
      title={t`Save`}
      variant="primary"
      size="small"
      accent="green"
      disabled={disabled}
      onClick={onSave}
      type="submit"
      Icon={IconDeviceFloppy}
    />
  );
};
