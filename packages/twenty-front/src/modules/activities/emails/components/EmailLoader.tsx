import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { t } from '@lingui/core/macro';

import { Loader } from 'twenty-ui/primitives/feedback';

export const EmailLoader = ({ loadingText }: { loadingText?: string }) => (
  <EmptyState.Root>
    <AnimatedPlaceholder type="loadingMessages" />
    <EmptyState.Content>
      <EmptyState.Title>{loadingText || t`Loading emails`}</EmptyState.Title>
      <Loader />
    </EmptyState.Content>
  </EmptyState.Root>
);
