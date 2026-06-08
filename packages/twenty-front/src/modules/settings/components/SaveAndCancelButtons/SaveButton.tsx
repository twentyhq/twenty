import { t } from '@lingui/core/macro';
import { type IconComponent, IconDeviceFloppy } from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';

type SaveButtonProps = {
  onSave?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  inverted?: boolean;
  saveIcon?: IconComponent;
};

export const SaveButton = ({
  onSave,
  disabled,
  isLoading,
  inverted = false,
  saveIcon,
}: SaveButtonProps) => {
  return (
    <Button
      title={t`Save`}
      variant={inverted ? 'secondary' : 'primary'}
      size="small"
      accent={inverted ? 'default' : 'blue'}
      inverted={inverted}
      disabled={disabled}
      onClick={onSave}
      type="submit"
      Icon={saveIcon ?? IconDeviceFloppy}
      isLoading={isLoading}
    />
  );
};
