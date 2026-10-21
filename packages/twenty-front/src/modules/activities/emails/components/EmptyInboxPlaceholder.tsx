import { LinkActivitiesDropdown } from '@/activities/components/LinkActivitiesDropdown';
import { LinkEmailThreadsDropdownContent } from '@/activities/emails/components/LinkEmailThreadsDropdownContent';
import { useComposeEmailForTargetRecord } from '@/activities/emails/hooks/useComposeEmailForTargetRecord';
import { useActivityLinkConfig } from '@/activities/hooks/useActivityLinkConfig';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
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
  const activityLinkConfig = useActivityLinkConfig({
    targetRecord,
    activityObjectNameSingular: CoreObjectNameSingular.MessageThread,
  });

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
        {isDefined(activityLinkConfig) && (
          <LinkActivitiesDropdown
            dropdownId={`empty-inbox-link-email-threads-${targetRecord.id}`}
            ariaLabel={t`Link email threads`}
            trigger={
              <Button startIcon={<IconLink />} variant="outline">
                {t`Link email threads`}
              </Button>
            }
          >
            <LinkEmailThreadsDropdownContent
              targetRecord={targetRecord}
              activityLinkConfig={activityLinkConfig}
            />
          </LinkActivitiesDropdown>
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
