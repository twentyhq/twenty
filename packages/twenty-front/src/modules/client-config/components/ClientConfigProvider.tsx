import { useRecoilValue } from 'recoil';

import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  height: 100dvh;
  width: 100%;
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
          shouldShowRefetch={false}
        />
      </StyledContainer>
    );
  }

  return isLoaded ? <>{children}</> : null;
};
