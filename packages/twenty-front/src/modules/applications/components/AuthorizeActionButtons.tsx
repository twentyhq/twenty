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
`;

const StyledCancelButton = styled(Button)`
  box-shadow: none;
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
        style={{
          fontWeight: 'var(--t-font-weight-semi-bold)',
          paddingInline: 'var(--t-spacing-3)',
        }}
      >{t`Cancel`}</StyledCancelButton>
      <StyledAuthorizeButton
        onClick={onAuthorize}
        disabled={isLoading}
        fullWidth
        elevated
        variant="solid"
        style={{
          fontWeight: 'var(--t-font-weight-semi-bold)',
          paddingInline: 'var(--t-spacing-3)',
        }}
      >
        {isLoading ? t`Authorizing...` : t`Authorize`}
      </StyledAuthorizeButton>
    </StyledButtonContainer>
  );
};
