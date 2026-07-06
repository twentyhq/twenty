import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkipButton = styled.button`
  background-color: transparent;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[5]};
`;

type OnboardingSkipButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const OnboardingSkipButton = ({
  onClick,
  disabled,
}: OnboardingSkipButtonProps) => {
  const { t } = useLingui();

  return (
    <StyledSkipButton type="button" onClick={onClick} disabled={disabled}>
      {t`Skip`}
    </StyledSkipButton>
  );
};
