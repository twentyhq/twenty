import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

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
      <MainButton
        elevated={false}
        onClick={onCancel}
        fullWidth
        disabled={isLoading}
        variant="outline"
      >{t`Cancel`}</MainButton>
      <MainButton
        elevated={false}
        onClick={onAuthorize}
        disabled={isLoading}
        fullWidth
      >
        {isLoading ? t`Authorizing...` : t`Authorize`}
      </MainButton>
    </StyledButtonContainer>
  );
};
