import { SettingsAdminQueueExpandableContainer } from '@/settings/admin-panel/components/SettingsAdminQueueExpandableContainer';
import { SettingsAdminQueueHealthButtons } from '@/settings/admin-panel/components/SettingsAdminQueueHealthButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { H2Title, Section, Status } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  AdminPanelIndicatorHealthStatusInputEnum,
  useGetIndicatorHealthStatusQuery,
} from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledStatusContainer = styled.div``;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailsContainer = styled.pre`
  background-color: ${({ theme }) => theme.background.quaternary};
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  white-space: pre-wrap;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const SettingsAdminIndicatorHealthStatus = () => {
  const { t } = useLingui();
  const { indicatorName } = useParams();
  const { data, loading } = useGetIndicatorHealthStatusQuery({
    variables: {
      indicatorName: indicatorName as AdminPanelIndicatorHealthStatusInputEnum,
    },
  });

  const formattedDetails = data?.getIndicatorHealthStatus.details
    ? JSON.stringify(JSON.parse(data.getIndicatorHealthStatus.details), null, 2)
    : null;

  const isWorkerDown =
    !data?.getIndicatorHealthStatus.status ||
    data?.getIndicatorHealthStatus.status ===
      AdminPanelHealthServiceStatus.OUTAGE;

  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);

  const toggleQueueVisibility = (queueName: string) => {
    setSelectedQueue(selectedQueue === queueName ? null : queueName);
  };

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Server Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Health Status`,
          href: getSettingsPath(SettingsPath.AdminPanelHealthStatus),
        },
        { children: `${indicatorName}` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={`${indicatorName}`} description="Health status" />
          <StyledStatusContainer>
            {data?.getIndicatorHealthStatus.status ===
              AdminPanelHealthServiceStatus.OPERATIONAL && (
              <Status color="green" text="Operational" weight="medium" />
            )}
            {data?.getIndicatorHealthStatus.status ===
              AdminPanelHealthServiceStatus.OUTAGE && (
              <Status color="red" text="Outage" weight="medium" />
            )}
          </StyledStatusContainer>
        </Section>

        {indicatorName === AdminPanelIndicatorHealthStatusInputEnum.WORKER ? (
          <Section>
            <StyledTitleContainer>
              <H2Title
                title="Queue Status"
                description="Background job processing status and metrics"
              />
            </StyledTitleContainer>
            {isWorkerDown && !loading ? (
              <StyledErrorMessage>
                Queue information is not available because the worker is down
              </StyledErrorMessage>
            ) : (
              <>
                <SettingsAdminQueueHealthButtons
                  queues={data?.getIndicatorHealthStatus.queues ?? []}
                  selectedQueue={selectedQueue}
                  toggleQueueVisibility={toggleQueueVisibility}
                />
                <SettingsAdminQueueExpandableContainer
                  queues={data?.getIndicatorHealthStatus.queues ?? []}
                  selectedQueue={selectedQueue}
                />
              </>
            )}
          </Section>
        ) : null}

        {indicatorName === AdminPanelIndicatorHealthStatusInputEnum.DATABASE ||
        indicatorName === AdminPanelIndicatorHealthStatusInputEnum.REDIS ? (
          <Section>
            {formattedDetails && (
              <StyledDetailsContainer>
                {formattedDetails}
              </StyledDetailsContainer>
            )}
          </Section>
        ) : null}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
