import { BUTTON_INVERTED_CLASS_NAME } from '@/ui/input/styles/ButtonInvertedClassName';
import { t } from '@lingui/core/macro';
import { type IconComponent, IconDeviceFloppy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

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
      className={inverted ? BUTTON_INVERTED_CLASS_NAME : undefined}
      size="sm"
      disabled={disabled}
      onClick={onSave}
      type="submit"
      startIcon={<SaveIcon />}
      loading={isLoading}
      variant={inverted ? 'outline' : 'solid'}
      color={inverted ? 'neutral' : 'accent'}
    >{t`Save`}</Button>
  );
};
