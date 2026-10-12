import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledAuthorizationButton = styled(Button)`
  --tw-button-font-weight: var(--t-font-weight-semi-bold);
  --tw-button-padding-inline: var(--t-spacing-3);
`;

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

export const AuthorizeActionButtons = ({
  onAuthorize,
  onCancel,
  isLoading,
}: AuthorizeActionButtonsProps) => {
  const { t } = useLingui();

  return (
    <StyledButtonContainer>
      <StyledAuthorizationButton
        elevated={false}
        onClick={onCancel}
        fullWidth
        disabled={isLoading}
        variant="outline"
      >{t`Cancel`}</StyledAuthorizationButton>
      <StyledAuthorizationButton
        variant="solid"
        elevated={false}
        onClick={onAuthorize}
        disabled={isLoading}
        fullWidth
      >
        {isLoading ? t`Authorizing...` : t`Authorize`}
      </StyledAuthorizationButton>
    </StyledButtonContainer>
  );
};
