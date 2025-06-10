import { AppErrorDisplay } from '@/error-handler/components/internal/AppErrorDisplay';
import { AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

type AppPageErrorFallbackProps = AppErrorDisplayProps;

export const AppPageErrorFallback = ({
  error,
  resetErrorBoundary,
  title = 'Sorry, something went wrong',
}: AppPageErrorFallbackProps) => {
  return (
    <PageContainer>
      <PageHeader />

      <PageBody>
        <AppErrorDisplay
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          title={title}
        />
      </PageBody>
    </PageContainer>
  );
};
