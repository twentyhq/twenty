import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';

const StyledInvertedButton = styled(Button)`
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledSubtleButton = styled(Button)`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

type CancelButtonProps = {
  onCancel?: () => void;
  disabled?: boolean;
  inverted?: boolean;
};

export const CancelButton = ({
  onCancel,
  disabled = false,
  inverted = false,
}: CancelButtonProps) => {
  const { t } = useLingui();

  if (inverted) {
    return (
      <StyledInvertedButton
        size="sm"
        onClick={onCancel}
        disabled={disabled}
        variant="ghost"
      >{t`Cancel`}</StyledInvertedButton>
    );
  }

  return (
    <StyledSubtleButton
      onClick={onCancel}
      disabled={disabled}
      size="sm"
      variant="ghost"
    >{t`Cancel`}</StyledSubtleButton>
  );
};
