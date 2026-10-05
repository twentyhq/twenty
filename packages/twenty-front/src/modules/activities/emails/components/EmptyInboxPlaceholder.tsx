import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconMail } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

export const EmptyInboxPlaceholder = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { openComposer, loading } =
    useComposeEmailForTargetRecord(targetRecord);

  return (
    <EmptyState.Root>
      <AnimatedPlaceholder type="emptyInbox" />
      <EmptyState.Content>
        <EmptyState.Title>
          <Trans>Empty Inbox</Trans>
        </EmptyState.Title>
        <EmptyState.Description>
          <Trans>No email exchange has occurred with this record yet.</Trans>
        </EmptyState.Description>
      </EmptyState.Content>
      <Button
        startIcon={<IconMail />}
        onClick={openComposer}
        disabled={loading}
        variant="outline"
      >{t`Send Email`}</Button>
    </EmptyState.Root>
  );
};
