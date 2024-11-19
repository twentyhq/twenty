import { useRecoilValue } from 'recoil';

import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';
import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui';

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

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isLoaded, isErrored } = useRecoilValue(clientConfigApiStatusState);

  if (isLoaded && isErrored) {
    return (
      <StyledContainer>
        <GenericErrorFallback
          error={new Error('Failed to fetch')}
          resetErrorBoundary={() => {}}
          title="Unable to Reach Back-end"
          isInitialFetch
        />
      </StyledContainer>
    );
  }

  return isLoaded ? <>{children}</> : null;
};
