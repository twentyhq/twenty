import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui';
import { GenericErrorFallback } from './GenericErrorFallback';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  box-sizing: border-box;
  display: flex;
  height: 100dvh;
  width: 100%;
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-bottom: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: 0;
    padding-bottom: ${({ theme }) => theme.spacing(3)};
  }
`;

type ClientConfigErrorProps = {
  error: Error;
};

export const ClientConfigError = ({ error }: ClientConfigErrorProps) => {
  // TODO: Implement a better loading strategy
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <StyledContainer>
      <GenericErrorFallback
        error={error}
        resetErrorBoundary={handleReset}
        title="Unable to Reach Back-end"
        hidePageHeader
      />
    </StyledContainer>
  );
};
