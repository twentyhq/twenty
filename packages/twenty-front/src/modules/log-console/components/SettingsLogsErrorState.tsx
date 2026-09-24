import { useLingui } from '@lingui/react/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { ErrorState } from '@/ui/feedback/empty-state/components/ErrorState';

type SettingsLogsErrorStateProps = {
  onRetry: () => void;
};

export const SettingsLogsErrorState = ({
  onRetry,
}: SettingsLogsErrorStateProps) => {
  const { t } = useLingui();

  return (
    <ErrorState.Root>
      <AnimatedPlaceholder type="errorIndex" />
      <ErrorState.Content>
        <ErrorState.Title>{t`Couldn't load logs`}</ErrorState.Title>
        <ErrorState.Description>
          {t`Something went wrong while loading logs.`}
        </ErrorState.Description>
      </ErrorState.Content>
      <Button
        startIcon={<IconRefresh />}
        onClick={onRetry}
        variant="outline"
      >{t`Try again`}</Button>
    </ErrorState.Root>
  );
};
