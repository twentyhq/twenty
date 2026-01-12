import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow } from 'date-fns';
import {
  IconAlertCircle,
  IconBriefcase,
  IconCheck,
  IconHourglassHigh,
  IconLoader,
  IconMail,
  IconUsers,
  Status,
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
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledLastSynced = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledSectionLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const StyledCurrentSyncRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSyncItem = styled.div<{
  variant: 'pending' | 'imported' | 'complete';
}>`
  align-items: center;
  background-color: ${({ theme, variant }) => {
    if (variant === 'pending') return theme.color.orange3;
    if (variant === 'complete') return theme.color.green3;
    return theme.background.tertiary;
  }};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledSyncItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSyncItemIcon = styled.div<{
  variant: 'pending' | 'imported' | 'complete';
}>`
  align-items: center;
  color: ${({ theme, variant }) => {
    if (variant === 'pending') return theme.color.orange;
    if (variant === 'complete') return theme.color.green;
    return theme.font.color.secondary;
  }};
  display: flex;
  justify-content: center;
`;

const StyledSyncItemLabel = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledSyncItemValue = styled.span<{
  variant: 'pending' | 'imported' | 'complete';
}>`
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme, variant }) => {
    if (variant === 'pending') return theme.color.orange;
    if (variant === 'complete') return theme.color.green;
    return theme.font.color.primary;
  }};
`;

const StyledDivider = styled.div`
  background-color: ${({ theme }) => theme.border.color.light};
  height: 1px;
`;

const StyledTotalsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTotalItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTotalIcon = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledTotalValue = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledTotalLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
  text-align: center;
`;

const formatLastSynced = (
  lastSyncedAt: string | null,
  syncStatus: string,
): string => {
  if (syncStatus === 'ONGOING') {
    return t`Syncing now...`;
  }
  if (!lastSyncedAt) {
    return t`Never synced`;
  }
  try {
    const date = new Date(lastSyncedAt);
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });

    return t`Last synced ${timeAgo}`;
  } catch {
    return t`Never synced`;
  }
};

const getStatusProps = (
  syncStatus: string,
): {
  color: 'green' | 'turquoise' | 'orange' | 'red';
  text: string;
  isLoaderVisible?: boolean;
} => {
  switch (syncStatus) {
    case 'ACTIVE':
      return { color: 'green', text: t`Synced` };
    case 'ONGOING':
      return { color: 'turquoise', text: t`Importing`, isLoaderVisible: true };
    case 'NOT_SYNCED':
      return { color: 'orange', text: t`Not synced` };
    case 'FAILED_INSUFFICIENT_PERMISSIONS':
    case 'FAILED_UNKNOWN':
      return { color: 'red', text: t`Sync failed` };
    default:
      return { color: 'orange', text: t`Not synced` };
  }
};

export const SettingsAccountsSyncStatusCard = ({
  messageChannelId,
}: SettingsAccountsSyncStatusCardProps) => {
  const { data, loading, error } = useGetSyncStatistics(messageChannelId);

  if (loading) {
    return (
      <StyledCard rounded>
        <StyledHeader>
          <StyledHeaderLeft>
            <IconLoader size={16} />
            <StyledTitle>{t`Loading sync status...`}</StyledTitle>
          </StyledHeaderLeft>
        </StyledHeader>
      </StyledCard>
    );
  }

  if (error !== undefined || !data) {
    return (
      <StyledCard rounded>
        <StyledHeader>
          <StyledHeaderLeft>
            <IconAlertCircle size={16} />
            <StyledTitle>{t`Failed to load sync status`}</StyledTitle>
          </StyledHeaderLeft>
        </StyledHeader>
      </StyledCard>
    );
  }

  const stats = data.getSyncStatistics;
  const statusProps = getStatusProps(stats.syncStatus);
  const hasPending = stats.pendingMessages > 0;

  return (
    <StyledCard rounded>
      <StyledHeader>
        <StyledHeaderLeft>
          <StyledTitle>{t`Sync Status`}</StyledTitle>
          <Status
            color={statusProps.color}
            text={statusProps.text}
            weight="medium"
            isLoaderVisible={statusProps.isLoaderVisible}
          />
        </StyledHeaderLeft>
        <StyledLastSynced>
          {formatLastSynced(stats.lastSyncedAt, stats.syncStatus)}
        </StyledLastSynced>
      </StyledHeader>

      <StyledStatsContainer>
        <StyledSectionLabel>{t`Current Sync`}</StyledSectionLabel>
        <StyledCurrentSyncRow>
          {hasPending ? (
            <StyledSyncItem variant="pending">
              <StyledSyncItemContent>
                <StyledSyncItemIcon variant="pending">
                  <IconHourglassHigh size={18} />
                </StyledSyncItemIcon>
                <StyledSyncItemLabel>{t`Pending`}</StyledSyncItemLabel>
              </StyledSyncItemContent>
              <StyledSyncItemValue variant="pending">
                {stats.pendingMessages}
              </StyledSyncItemValue>
            </StyledSyncItem>
          ) : (
            <StyledSyncItem variant="complete">
              <StyledSyncItemContent>
                <StyledSyncItemIcon variant="complete">
                  <IconCheck size={18} />
                </StyledSyncItemIcon>
                <StyledSyncItemLabel>{t`No pending import`}</StyledSyncItemLabel>
              </StyledSyncItemContent>
            </StyledSyncItem>
          )}
          <StyledSyncItem variant="imported">
            <StyledSyncItemContent>
              <StyledSyncItemIcon variant="imported">
                <IconMail size={18} />
              </StyledSyncItemIcon>
              <StyledSyncItemLabel>{t`Imported`}</StyledSyncItemLabel>
            </StyledSyncItemContent>
            <StyledSyncItemValue variant="imported">
              {stats.importedMessages}
            </StyledSyncItemValue>
          </StyledSyncItem>
        </StyledCurrentSyncRow>

        <StyledDivider />

        <StyledSectionLabel>{t`Total`}</StyledSectionLabel>
        <StyledTotalsRow>
          <StyledTotalItem>
            <StyledTotalIcon>
              <IconMail size={16} />
            </StyledTotalIcon>
            <StyledTotalValue>{stats.importedMessages}</StyledTotalValue>
            <StyledTotalLabel>{t`Messages`}</StyledTotalLabel>
          </StyledTotalItem>
          <StyledTotalItem>
            <StyledTotalIcon>
              <IconUsers size={16} />
            </StyledTotalIcon>
            <StyledTotalValue>{stats.contactsCreated}</StyledTotalValue>
            <StyledTotalLabel>{t`Contacts`}</StyledTotalLabel>
          </StyledTotalItem>
          <StyledTotalItem>
            <StyledTotalIcon>
              <IconBriefcase size={16} />
            </StyledTotalIcon>
            <StyledTotalValue>{stats.companiesCreated}</StyledTotalValue>
            <StyledTotalLabel>{t`Companies`}</StyledTotalLabel>
          </StyledTotalItem>
        </StyledTotalsRow>
      </StyledStatsContainer>
    </StyledCard>
  );
};
