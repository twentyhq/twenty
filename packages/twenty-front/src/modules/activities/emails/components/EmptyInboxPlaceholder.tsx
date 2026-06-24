import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconMail } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/feedback';

export const EmptyInboxPlaceholder = () => {
  const { t } = useLingui();
  const { openComposer, loading } = useComposeEmailForTargetRecord();

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
        Icon={IconMail}
        title={t`Send Email`}
        variant="secondary"
        onClick={openComposer}
        disabled={loading}
      />
    </AnimatedPlaceholderEmptyContainer>
  );
};
