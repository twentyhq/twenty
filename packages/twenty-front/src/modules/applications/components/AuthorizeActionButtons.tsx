import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AuthorizeActionButtonsProps = {
  onAuthorize: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

const StyledButtonContainer = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(
    2,
    minmax(${themeCssVariables.spacing[0]}, 1fr)
  );
  margin-top: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledAuthorizeButton = styled(Button)`
  box-shadow: none;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-inline: ${themeCssVariables.spacing[3]};
`;

const StyledCancelButton = styled(Button)`
  box-shadow: none;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-inline: ${themeCssVariables.spacing[3]};
`;

export const AuthorizeActionButtons = ({
  onAuthorize,
  onCancel,
  isLoading,
}: AuthorizeActionButtonsProps) => {
  const { t } = useLingui();

  return (
    <StyledButtonContainer>
      <StyledCancelButton
        onClick={onCancel}
        fullWidth
        disabled={isLoading}
        elevated
        variant="outline"
      >{t`Cancel`}</StyledCancelButton>
      <StyledAuthorizeButton
        onClick={onAuthorize}
        disabled={isLoading}
        fullWidth
        elevated
        variant="solid"
      >
        {isLoading ? t`Authorizing...` : t`Authorize`}
      </StyledAuthorizeButton>
    </StyledButtonContainer>
  );
};
