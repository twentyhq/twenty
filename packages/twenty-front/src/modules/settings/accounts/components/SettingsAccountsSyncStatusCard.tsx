import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  IconBriefcase,
  IconLoader,
  IconMail,
  IconUsers,
} from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';

import { useGetSyncStatistics } from '@/settings/accounts/hooks/useGetSyncStatistics';

type SettingsAccountsSyncStatusCardProps = {
  messageChannelId: string;
};

const StyledCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledTitle = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledStatusBadge = styled.span<{ status: string }>`
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(2)}`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  background-color: ${({ theme, status }) => {
    switch (status) {
      case 'ACTIVE':
        return theme.color.green10;
      case 'ONGOING':
        return theme.color.blue10;
      case 'FAILED':
        return theme.color.red10;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'ACTIVE':
        return theme.color.green;
      case 'ONGOING':
        return theme.color.blue;
      case 'FAILED':
        return theme.color.red;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

const StyledStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledStatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledStatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.tertiary};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledStatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledStatValue = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledStatLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const formatSyncStage = (stage: string): string => {
  const stageMap: Record<string, string> = {
    PENDING_CONFIGURATION: t`Pending configuration`,
    MESSAGE_LIST_FETCH_PENDING: t`Fetching message list...`,
    MESSAGE_LIST_FETCH_SCHEDULED: t`Message list fetch scheduled`,
    MESSAGE_LIST_FETCH_ONGOING: t`Fetching message list...`,
    MESSAGES_IMPORT_PENDING: t`Import pending`,
    MESSAGES_IMPORT_SCHEDULED: t`Import scheduled`,
    MESSAGES_IMPORT_ONGOING: t`Importing messages...`,
  };
  return stageMap[stage] || stage;
};

export const SettingsAccountsSyncStatusCard = ({
  messageChannelId,
}: SettingsAccountsSyncStatusCardProps) => {
  const { data, loading } = useGetSyncStatistics(messageChannelId);

  if (loading || !data) {
    return (
      <StyledCard rounded>
        <StyledHeader>
          <IconLoader size={16} />
          <StyledTitle>{t`Loading sync status...`}</StyledTitle>
        </StyledHeader>
      </StyledCard>
    );
  }

  const stats = data.getSyncStatistics;

  return (
    <StyledCard rounded>
      <StyledHeader>
        <StyledTitle>{t`Sync Status`}</StyledTitle>
        <StyledStatusBadge status={stats.syncStatus}>
          {stats.syncStatus === 'ACTIVE'
            ? t`Synced`
            : stats.syncStatus === 'ONGOING'
              ? formatSyncStage(stats.syncStage)
              : stats.syncStatus}
        </StyledStatusBadge>
      </StyledHeader>
      <StyledStatsGrid>
        <StyledStatItem>
          <StyledStatIcon>
            <IconMail size={16} />
          </StyledStatIcon>
          <StyledStatContent>
            <StyledStatValue>{stats.importedMessages}</StyledStatValue>
            <StyledStatLabel>{t`Messages imported`}</StyledStatLabel>
          </StyledStatContent>
        </StyledStatItem>
        <StyledStatItem>
          <StyledStatIcon>
            <IconLoader size={16} />
          </StyledStatIcon>
          <StyledStatContent>
            <StyledStatValue>{stats.pendingMessages}</StyledStatValue>
            <StyledStatLabel>{t`Pending import`}</StyledStatLabel>
          </StyledStatContent>
        </StyledStatItem>
        <StyledStatItem>
          <StyledStatIcon>
            <IconUsers size={16} />
          </StyledStatIcon>
          <StyledStatContent>
            <StyledStatValue>{stats.contactsCreated}</StyledStatValue>
            <StyledStatLabel>{t`Contacts created`}</StyledStatLabel>
          </StyledStatContent>
        </StyledStatItem>
        <StyledStatItem>
          <StyledStatIcon>
            <IconBriefcase size={16} />
          </StyledStatIcon>
          <StyledStatContent>
            <StyledStatValue>{stats.companiesCreated}</StyledStatValue>
            <StyledStatLabel>{t`Companies created`}</StyledStatLabel>
          </StyledStatContent>
        </StyledStatItem>
      </StyledStatsGrid>
    </StyledCard>
  );
};
