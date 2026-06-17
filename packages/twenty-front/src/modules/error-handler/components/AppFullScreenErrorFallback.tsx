import { AppErrorDisplay } from '@/error-handler/components/internal/AppErrorDisplay';
import { type AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AppFullScreenErrorFallbackProps = AppErrorDisplayProps;

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  box-sizing: border-box;
  display: flex;
  height: 100dvh;
  width: 100vw;
`;

export const AppFullScreenErrorFallback = ({
  error,
  resetErrorBoundary,
  title = t`Sorry, something went wrong`,
}: AppFullScreenErrorFallbackProps) => {
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
