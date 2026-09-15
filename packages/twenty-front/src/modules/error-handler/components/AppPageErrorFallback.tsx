import { AppErrorDisplay } from '@/error-handler/components/internal/AppErrorDisplay';
import { type AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { t } from '@lingui/core/macro';

type AppPageErrorFallbackProps = AppErrorDisplayProps;

export const AppPageErrorFallback = ({
  error,
  resetErrorBoundary,
  title = t`Sorry, something went wrong`,
}: AppPageErrorFallbackProps) => {
  return (
    <PageCardLayout header={null} showInformationBanner={false}>
      <AppErrorDisplay
        error={error}
        resetErrorBoundary={resetErrorBoundary}
        title={title}
      />
    </PageCardLayout>
  );
};
