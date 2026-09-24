import { useLingui } from '@lingui/react/macro';

import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';

export const SettingsLogsEmptyState = () => {
  const { t } = useLingui();

  return (
    <EmptyState.Root>
      <AnimatedPlaceholder type="noRecord" />
      <EmptyState.Content>
        <EmptyState.Title>{t`No logs yet`}</EmptyState.Title>
      </EmptyState.Content>
    </EmptyState.Root>
  );
};
