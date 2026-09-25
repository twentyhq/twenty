import { type AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { t } from '@lingui/core/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

export const AppErrorDisplay = ({
  resetErrorBoundary,
  title = t`Sorry, something went wrong`,
}: AppErrorDisplayProps) => {
  return (
    <EmptyState.Root>
      <AnimatedPlaceholder type="errorIndex" />
      <EmptyState.Content>
        <EmptyState.Title>{title}</EmptyState.Title>
        <EmptyState.Description>
          {t`Please refresh the page.`}
        </EmptyState.Description>
      </EmptyState.Content>
      <Button
        startIcon={<IconRefresh />}
        onClick={resetErrorBoundary}
        variant="outline"
      >{t`Reload`}</Button>
    </EmptyState.Root>
  );
};
