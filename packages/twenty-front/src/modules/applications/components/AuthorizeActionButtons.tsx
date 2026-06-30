import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/input';
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

const StyledAuthorizeButton = styled(MainButton)`
  box-shadow: none;
`;

const StyledCancelButton = styled(MainButton)`
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
        title={t`Cancel`}
        variant="secondary"
        onClick={onCancel}
        fullWidth
        disabled={isLoading}
      />
      <StyledAuthorizeButton
        title={isLoading ? t`Authorizing...` : t`Authorize`}
        onClick={onAuthorize}
        disabled={isLoading}
        fullWidth
      />
    </StyledButtonContainer>
  );
};
