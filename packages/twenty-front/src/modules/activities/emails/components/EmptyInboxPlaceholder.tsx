import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconMail } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/primitives/feedback';

export const EmptyInboxPlaceholder = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { openComposer, loading } =
    useComposeEmailForTargetRecord(targetRecord);

  return (
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder type="emptyInbox" />
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>
          <Trans>Empty Inbox</Trans>
        </AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          <Trans>No email exchange has occurred with this record yet.</Trans>
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
      <Button
        startIcon={<IconMail />}
        onClick={openComposer}
        disabled={loading}
        variant="outline"
      >{t`Send Email`}</Button>
    </AnimatedPlaceholderEmptyContainer>
  );
};
