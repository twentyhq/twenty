import { AppErrorDisplay } from '@/error-handler/components/internal/AppErrorDisplay';
import { AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import styled from '@emotion/styled';

type AppFullScreenErrorFallbackProps = AppErrorDisplayProps;

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.noisy};
  box-sizing: border-box;
  display: flex;
  height: 100vh;
  width: 100vw;
  padding-top: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
`;

export const AppFullScreenErrorFallback = ({
  error,
  resetErrorBoundary,
  title = 'Sorry, something went wrong',
}: AppFullScreenErrorFallbackProps) => {
  return (
    <StyledContainer>
      <PageBody>
        <AppErrorDisplay
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          title={title}
        />
      </PageBody>
    </StyledContainer>
  );
};
