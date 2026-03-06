import { AppErrorDisplay } from '@/error-handler/components/internal/AppErrorDisplay';
import { type AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AppFullScreenErrorFallbackProps = AppErrorDisplayProps;

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  height: 100vh;
  padding-left: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[3]};
  width: 100vw;
`;

export const AppFullScreenErrorFallback = ({
  error,
  resetErrorBoundary,
  title = t`Sorry, something went wrong`,
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
