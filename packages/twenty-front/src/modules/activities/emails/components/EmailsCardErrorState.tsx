import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { ErrorState } from '@/ui/feedback/empty-state/components/ErrorState';
import { useLingui } from '@lingui/react/macro';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type EmailsCardErrorStateProps = {
  onRetry: () => void;
};

export const EmailsCardErrorState = ({
  onRetry,
}: EmailsCardErrorStateProps) => {
  const { t } = useLingui();

  return (
    <ErrorState.Root>
      <AnimatedPlaceholder type="errorIndex" />
      <ErrorState.Content>
        <ErrorState.Title>{t`We couldn't load the messages`}</ErrorState.Title>
        <ErrorState.Description>
          {t`Something went wrong while fetching this record's messages.`}
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
