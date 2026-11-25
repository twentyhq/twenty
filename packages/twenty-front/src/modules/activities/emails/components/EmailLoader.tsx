import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { Loader } from 'twenty-ui/primitives/feedback';
import { useLingui } from '@lingui/react/macro';

export const EmailLoader = ({ loadingText }: { loadingText?: string }) => {
  const { t } = useLingui();
  return (
    <EmptyState.Root>
      <AnimatedPlaceholder type="loadingMessages" />
      <EmptyState.Content>
        <EmptyState.Title>{loadingText || t`Loading emails`}</EmptyState.Title>
        <Loader />
      </EmptyState.Content>
    </EmptyState.Root>
  );
};
