import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type IconComponent, IconDeviceFloppy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

const StyledSaveButton = styled(Button)`
  &[data-inverted='true'] {
    color: ${themeCssVariables.font.color.inverted};
  }
`;

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
    <StyledSaveButton
      size="sm"
      disabled={disabled}
      onClick={onSave}
      type="submit"
      startIcon={<SaveIcon />}
      loading={isLoading}
      variant={inverted ? 'outline' : 'solid'}
      color={inverted ? 'neutral' : 'accent'}
      data-inverted={inverted}
    >{t`Save`}</StyledSaveButton>
  );
};
