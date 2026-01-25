import styled from '@emotion/styled';
import {
    IconAlertCircle,
    IconArrowRight,
    IconCheck,
    IconClock,
    IconDatabase,
    IconPlugConnected,
    IconRefresh,
    IconShield,
    IconUser,
    IconUsers,
    IconX
} from 'twenty-ui/display';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const WelcomeText = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0 0 8px 0;
`;

const SubText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ accentColor: string }>`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ accentColor }) => accentColor};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => `${color}15`};
  border-radius: 10px;
  color: ${({ color }) => color};
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 4px;
`;

const StatSubtext = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: ${({ theme }) => theme.color.blue};
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const TeamTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TeamTableHeader = styled.thead`
  background: ${({ theme }) => theme.background.tertiary};
`;

const TeamTableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TeamTableBody = styled.tbody``;

const TeamTableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TeamTableCell = styled.td`
  padding: 14px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const MemberCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MemberAvatar = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => `${color}20`};
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  color: ${({ color }) => color};
`;

const MemberInfo = styled.div``;

const MemberName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const MemberEmail = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const RoleBadge = styled.span<{ role: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ role }) =>
    role === 'admin'
      ? '#EF444415'
      : role === 'manager'
        ? '#8B5CF615'
        : role === 'agent'
          ? '#3B82F615'
          : '#10B98115'};
  color: ${({ role }) =>
    role === 'admin'
      ? '#EF4444'
      : role === 'manager'
        ? '#8B5CF6'
        : role === 'agent'
          ? '#3B82F6'
          : '#10B981'};
`;

const StatusIndicator = styled.div<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${({ active }) => (active ? '#10B981' : '#6B7280')};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ active }) => (active ? '#10B981' : '#6B7280')};
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SystemStatusList = styled.div`
  padding: 0;
`;

const SystemStatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const SystemIcon = styled.div<{ status: string }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${({ status }) =>
    status === 'healthy' ? '#10B98115' : status === 'warning' ? '#F59E0B15' : '#EF444415'};
  color: ${({ status }) =>
    status === 'healthy' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444'};
`;

const SystemInfo = styled.div`
  flex: 1;
`;

const SystemName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const SystemDetails = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const SystemStatusBadge = styled.div<{ status: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ status }) =>
    status === 'healthy' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444'};
`;

const IntegrationList = styled.div`
  padding: 0;
`;

const IntegrationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const IntegrationIcon = styled.div<{ connected: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${({ connected }) => (connected ? '#10B98115' : '#6B728015')};
  color: ${({ connected }) => (connected ? '#10B981' : '#6B7280')};
`;

const IntegrationInfo = styled.div`
  flex: 1;
`;

const IntegrationName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const IntegrationStatus = styled.div<{ connected: boolean }>`
  font-size: 12px;
  color: ${({ connected }) => (connected ? '#10B981' : '#6B7280')};
`;

const IntegrationAction = styled.button`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 6px;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
  }
`;

const ActivityList = styled.div`
  padding: 0;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div<{ type: string }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: ${({ type }) =>
    type === 'user' ? '#3B82F615' : type === 'system' ? '#8B5CF615' : '#10B98115'};
  color: ${({ type }) => (type === 'user' ? '#3B82F6' : type === 'system' ? '#8B5CF6' : '#10B981')};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-top: 4px;
`;

// Mock data
const stats = [
  { label: 'Total Team Members', value: 24, subtext: '18 active today', color: '#6366F1', icon: IconUsers },
  { label: 'Active Sessions', value: 18, subtext: 'Currently logged in', color: '#10B981', icon: IconUser },
  { label: 'System Health', value: '99.9%', subtext: 'Uptime this month', color: '#3B82F6', icon: IconDatabase },
  { label: 'Pending Actions', value: 5, subtext: 'Require attention', color: '#F59E0B', icon: IconAlertCircle },
];

const teamMembers = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@aira.com', role: 'admin', department: 'Operations', status: true, lastActive: 'Now', initials: 'SJ', color: '#3B82F6' },
  { id: 2, name: 'Michael Chen', email: 'michael@aira.com', role: 'manager', department: 'Sales', status: true, lastActive: 'Now', initials: 'MC', color: '#10B981' },
  { id: 3, name: 'Emily Davis', email: 'emily@aira.com', role: 'agent', department: 'Sales', status: true, lastActive: '5m ago', initials: 'ED', color: '#F59E0B' },
  { id: 4, name: 'James Wilson', email: 'james@aira.com', role: 'tc', department: 'Transaction', status: false, lastActive: '2h ago', initials: 'JW', color: '#8B5CF6' },
  { id: 5, name: 'Lisa Anderson', email: 'lisa@aira.com', role: 'agent', department: 'Sales', status: true, lastActive: 'Now', initials: 'LA', color: '#EC4899' },
];

const systemStatus = [
  { name: 'Database', details: 'PostgreSQL v15.2', status: 'healthy' },
  { name: 'API Server', details: 'Response time: 42ms', status: 'healthy' },
  { name: 'Email Service', details: 'SendGrid', status: 'healthy' },
  { name: 'Storage', details: '78% capacity used', status: 'warning' },
];

const integrations = [
  { name: 'Google Workspace', connected: true },
  { name: 'DocuSign', connected: true },
  { name: 'Zapier', connected: true },
  { name: 'Slack', connected: false },
];

const recentActivity = [
  { type: 'user', text: 'Sarah Johnson updated team permissions', time: '5 minutes ago' },
  { type: 'system', text: 'Automated backup completed', time: '1 hour ago' },
  { type: 'user', text: 'Michael Chen added new team member', time: '2 hours ago' },
  { type: 'security', text: 'Security scan completed - no issues', time: '4 hours ago' },
];

export const OperationsDashboard = () => {
  return (
    <Container>
      <Header>
        <WelcomeText>Operations Dashboard</WelcomeText>
        <SubText>Team management, system health, and administrative controls</SubText>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index} accentColor={stat.color}>
            <StatHeader>
              <StatIcon color={stat.color}>
                <stat.icon size={20} />
              </StatIcon>
              <StatLabel>{stat.label}</StatLabel>
            </StatHeader>
            <StatValue>{stat.value}</StatValue>
            <StatSubtext>{stat.subtext}</StatSubtext>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentGrid>
        <div>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconUsers size={18} />
                Team Members
              </SectionTitle>
              <ViewAllButton>
                Manage Team <IconArrowRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            <TeamTable>
              <TeamTableHeader>
                <tr>
                  <TeamTableHeaderCell>Member</TeamTableHeaderCell>
                  <TeamTableHeaderCell>Role</TeamTableHeaderCell>
                  <TeamTableHeaderCell>Department</TeamTableHeaderCell>
                  <TeamTableHeaderCell>Status</TeamTableHeaderCell>
                  <TeamTableHeaderCell>Last Active</TeamTableHeaderCell>
                </tr>
              </TeamTableHeader>
              <TeamTableBody>
                {teamMembers.map((member) => (
                  <TeamTableRow key={member.id}>
                    <TeamTableCell>
                      <MemberCell>
                        <MemberAvatar color={member.color}>{member.initials}</MemberAvatar>
                        <MemberInfo>
                          <MemberName>{member.name}</MemberName>
                          <MemberEmail>{member.email}</MemberEmail>
                        </MemberInfo>
                      </MemberCell>
                    </TeamTableCell>
                    <TeamTableCell>
                      <RoleBadge role={member.role}>
                        {member.role === 'admin'
                          ? 'Admin'
                          : member.role === 'manager'
                            ? 'Manager'
                            : member.role === 'agent'
                              ? 'Agent'
                              : 'TC'}
                      </RoleBadge>
                    </TeamTableCell>
                    <TeamTableCell>{member.department}</TeamTableCell>
                    <TeamTableCell>
                      <StatusIndicator active={member.status}>
                        {member.status ? 'Online' : 'Offline'}
                      </StatusIndicator>
                    </TeamTableCell>
                    <TeamTableCell>{member.lastActive}</TeamTableCell>
                  </TeamTableRow>
                ))}
              </TeamTableBody>
            </TeamTable>
          </Section>

          <Section style={{ marginTop: 24 }}>
            <SectionHeader>
              <SectionTitle>
                <IconClock size={18} />
                Recent Activity
              </SectionTitle>
              <ViewAllButton>
                View Logs <IconArrowRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            <ActivityList>
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index}>
                  <ActivityIcon type={activity.type}>
                    {activity.type === 'user' ? (
                      <IconUser size={16} />
                    ) : activity.type === 'system' ? (
                      <IconRefresh size={16} />
                    ) : (
                      <IconShield size={16} />
                    )}
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityText>{activity.text}</ActivityText>
                    <ActivityTime>{activity.time}</ActivityTime>
                  </ActivityContent>
                </ActivityItem>
              ))}
            </ActivityList>
          </Section>
        </div>

        <RightColumn>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconDatabase size={18} />
                System Status
              </SectionTitle>
            </SectionHeader>
            <SystemStatusList>
              {systemStatus.map((system, index) => (
                <SystemStatusItem key={index}>
                  <SystemIcon status={system.status}>
                    {system.status === 'healthy' ? (
                      <IconCheck size={16} />
                    ) : system.status === 'warning' ? (
                      <IconAlertCircle size={16} />
                    ) : (
                      <IconX size={16} />
                    )}
                  </SystemIcon>
                  <SystemInfo>
                    <SystemName>{system.name}</SystemName>
                    <SystemDetails>{system.details}</SystemDetails>
                  </SystemInfo>
                  <SystemStatusBadge status={system.status}>
                    {system.status === 'healthy'
                      ? 'Healthy'
                      : system.status === 'warning'
                        ? 'Warning'
                        : 'Error'}
                  </SystemStatusBadge>
                </SystemStatusItem>
              ))}
            </SystemStatusList>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconPlugConnected size={18} />
                Integrations
              </SectionTitle>
            </SectionHeader>
            <IntegrationList>
              {integrations.map((integration, index) => (
                <IntegrationItem key={index}>
                  <IntegrationIcon connected={integration.connected}>
                    <IconPlugConnected size={16} />
                  </IntegrationIcon>
                  <IntegrationInfo>
                    <IntegrationName>{integration.name}</IntegrationName>
                    <IntegrationStatus connected={integration.connected}>
                      {integration.connected ? 'Connected' : 'Not connected'}
                    </IntegrationStatus>
                  </IntegrationInfo>
                  <IntegrationAction>
                    {integration.connected ? 'Settings' : 'Connect'}
                  </IntegrationAction>
                </IntegrationItem>
              ))}
            </IntegrationList>
          </Section>
        </RightColumn>
      </ContentGrid>
    </Container>
  );
};
