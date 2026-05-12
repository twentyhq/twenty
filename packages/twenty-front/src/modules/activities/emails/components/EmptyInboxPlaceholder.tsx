import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconMail } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

export const EmptyInboxPlaceholder = () => {
  const { t } = useLingui();
  const { openComposer, loading } = useComposeEmailForTargetRecord();

  return (
    <AnimatedPlaceholderEmptyContainer
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
    >
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
