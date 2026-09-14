import { t } from '@lingui/core/macro';
import { type IconComponent, IconDeviceFloppy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

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
  saveIcon: SaveIcon = IconDeviceFloppy,
}: SaveButtonProps) => {
  return (
    <Button
      size="sm"
      disabled={disabled}
      onClick={onSave}
      type="submit"
      startIcon={<SaveIcon />}
      loading={isLoading}
      variant={inverted ? 'outline' : 'solid'}
      color={inverted ? 'neutral' : 'accent'}
      style={{ color: inverted ? 'var(--t-font-color-inverted)' : undefined }}
    >{t`Save`}</Button>
  );
};
