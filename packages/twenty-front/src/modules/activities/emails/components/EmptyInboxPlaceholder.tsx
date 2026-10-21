import { LinkEmailThreadsDropdown } from '@/activities/emails/components/LinkEmailThreadsDropdown';
import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { useEmailThreadLinkConfig } from '@/activities/emails/hooks/useEmailThreadLinkConfig';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLink, IconMail } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

export const EmptyInboxPlaceholder = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { openComposer, loading } =
    useComposeEmailForTargetRecord(targetRecord);
  const emailThreadLinkConfig = useEmailThreadLinkConfig(targetRecord);

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
      <StyledButtons>
        {isDefined(emailThreadLinkConfig) && (
          <LinkEmailThreadsDropdown
            dropdownId={`empty-inbox-link-email-threads-${targetRecord.id}`}
            targetRecord={targetRecord}
            emailThreadLinkConfig={emailThreadLinkConfig}
            trigger={
              <Button startIcon={<IconLink />} variant="outline">
                {t`Link email threads`}
              </Button>
            }
          />
        )}
        <Button
          startIcon={<IconMail />}
          onClick={openComposer}
          disabled={loading}
          variant="outline"
        >{t`Send Email`}</Button>
      </StyledButtons>
    </EmptyState.Root>
  );
};
