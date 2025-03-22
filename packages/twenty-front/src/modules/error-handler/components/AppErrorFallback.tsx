import { AppErrorDisplay } from '@/error-handler/components/AppErrorDisplay';
import { AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import styled from '@emotion/styled';

type AppErrorFallbackProps = AppErrorDisplayProps;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

export const AppErrorFallback = ({
  error,
  resetErrorBoundary,
  title = 'Sorry, something went wrong',
}: AppErrorFallbackProps) => {
  return (
    <StyledContainer>
      <AppErrorDisplay
        error={error}
        resetErrorBoundary={resetErrorBoundary}
        title={title}
      />
    </StyledContainer>
  );
};
