import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsInboxQueuesTable } from '@/settings/inbox/components/SettingsInboxQueuesTable';
import { SettingsInboxRoutingTable } from '@/settings/inbox/components/SettingsInboxRoutingTable';
import { useInboxSettings } from '@/settings/inbox/hooks/useInboxSettings';

const StyledButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsInbox = () => {
  const { t } = useLingui();
  const { inboxQueues, inboxItemTypes } = useInboxSettings();

  return (
    <SettingsPageLayout
      title={t`Inbox`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
        { children: t`Inbox` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Shared inboxes`}
            description={t`An inbox a team watches together. Work sent here is nobody's until someone takes it.`}
          />
          <SettingsInboxQueuesTable inboxQueues={inboxQueues} />
          <StyledButtonRow>
            <Button
              Icon={IconPlus}
              title={t`New shared inbox`}
              accent="blue"
              size="small"
              to={getSettingsPath(SettingsPath.InboxQueueNew)}
            />
          </StyledButtonRow>
        </Section>
        <Section>
          <H2Title
            title={t`Routing`}
            description={t`Where each kind of work goes when nothing named a recipient. Rules with conditions belong in a workflow.`}
          />
          <SettingsInboxRoutingTable
            inboxItemTypes={inboxItemTypes}
            inboxQueues={inboxQueues}
          />
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
