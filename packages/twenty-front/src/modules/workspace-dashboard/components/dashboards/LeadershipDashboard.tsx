import styled from '@emotion/styled';
import {
    IconArrowRight,
    IconAward,
    IconBriefcase,
    IconCalendar,
    IconCash,
    IconChartBar,
    IconHome,
    IconTarget,
    IconTrendingDown,
    IconTrendingUp,
    IconUsers,
} from 'twenty-ui/display';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const HeaderLeft = styled.div``;

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

const PeriodSelector = styled.select`
  padding: 10px 16px;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
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

const StatChange = styled.div<{ positive: boolean }>`
  font-size: 12px;
  color: ${({ positive }) => (positive ? '#10B981' : '#EF4444')};
  display: flex;
  align-items: center;
  gap: 4px;
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

const LeaderboardList = styled.div`
  padding: 0;
`;

const LeaderboardItem = styled.div<{ rank: number }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  background: ${({ rank }) =>
    rank === 1 ? '#F59E0B08' : rank === 2 ? '#9CA3AF08' : rank === 3 ? '#CD7F3208' : 'transparent'};

  &:last-child {
    border-bottom: none;
  }
`;

const RankBadge = styled.div<{ rank: number }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  background: ${({ rank }) =>
    rank === 1
      ? 'linear-gradient(135deg, #F59E0B, #D97706)'
      : rank === 2
        ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
        : rank === 3
          ? 'linear-gradient(135deg, #CD7F32, #A0522D)'
          : '#E5E7EB'};
  color: ${({ rank }) => (rank <= 3 ? 'white' : '#6B7280')};
`;

const AgentAvatar = styled.div<{ color: string }>`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => `${color}20`};
  border-radius: 50%;
  font-size: 16px;
  font-weight: 600;
  color: ${({ color }) => color};
`;

const AgentInfo = styled.div`
  flex: 1;
`;

const AgentName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const AgentRole = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const AgentStats = styled.div`
  display: flex;
  gap: 24px;
`;

const AgentStat = styled.div`
  text-align: center;
`;

const AgentStatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const AgentStatLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MetricCard = styled.div`
  padding: 20px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const MetricValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const GoalProgress = styled.div`
  padding: 20px;
`;

const GoalItem = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const GoalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const GoalLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const GoalValue = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const ProgressBar = styled.div`
  height: 10px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number; color: string }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: ${({ color }) => color};
  border-radius: 5px;
  transition: width 0.3s;
`;

const TopDealsSection = styled.div`
  padding: 0;
`;

const DealItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const DealIcon = styled.div`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 10px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const DealDetails = styled.div`
  flex: 1;
`;

const DealAddress = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const DealMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const DealValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const DealCommission = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.blue};
`;

// Mock data
const stats = [
  { label: 'Total Revenue YTD', value: '$2.4M', change: '+24% vs last year', positive: true, color: '#10B981', icon: IconCash },
  { label: 'Transactions YTD', value: 156, change: '+18 vs last year', positive: true, color: '#3B82F6', icon: IconBriefcase },
  { label: 'Active Agents', value: 24, change: '+4 this quarter', positive: true, color: '#8B5CF6', icon: IconUsers },
  { label: 'Avg Days on Market', value: 28, change: '-5 days vs avg', positive: true, color: '#F59E0B', icon: IconCalendar },
];

const leaderboard = [
  { rank: 1, name: 'Sarah Johnson', role: 'Senior Agent', transactions: 28, volume: '$8.2M', commission: '$246K', initials: 'SJ', color: '#3B82F6' },
  { rank: 2, name: 'Michael Chen', role: 'Agent', transactions: 24, volume: '$6.8M', commission: '$204K', initials: 'MC', color: '#10B981' },
  { rank: 3, name: 'Emily Davis', role: 'Agent', transactions: 22, volume: '$6.1M', commission: '$183K', initials: 'ED', color: '#F59E0B' },
  { rank: 4, name: 'James Wilson', role: 'Agent', transactions: 19, volume: '$5.2M', commission: '$156K', initials: 'JW', color: '#8B5CF6' },
  { rank: 5, name: 'Lisa Anderson', role: 'Agent', transactions: 17, volume: '$4.8M', commission: '$144K', initials: 'LA', color: '#EC4899' },
];

const companyMetrics = [
  { label: 'Total Listings', value: '142' },
  { label: 'Under Contract', value: '38' },
  { label: 'Avg Sale Price', value: '$425K' },
  { label: 'Market Share', value: '12.4%' },
  { label: 'Client Satisfaction', value: '4.8/5' },
];

const goals = [
  { label: 'Revenue Goal', current: '$2.4M', target: '$3M', progress: 80, color: '#10B981' },
  { label: 'Transaction Goal', current: '156', target: '200', progress: 78, color: '#3B82F6' },
  { label: 'New Agents', current: '4', target: '6', progress: 67, color: '#8B5CF6' },
];

const topDeals = [
  { address: '1156 Sunset Boulevard', city: 'Austin, TX', agent: 'Emily Davis', value: '$675,000', commission: '$20,250' },
  { address: '892 Lakefront Estate', city: 'Austin, TX', agent: 'Sarah Johnson', value: '$1,250,000', commission: '$37,500' },
  { address: '4521 Oak Haven Drive', city: 'Round Rock, TX', agent: 'Sarah Johnson', value: '$485,000', commission: '$14,550' },
];

export const LeadershipDashboard = () => {
  return (
    <Container>
      <Header>
        <HeaderLeft>
          <WelcomeText>Leadership Dashboard</WelcomeText>
          <SubText>Company performance, team metrics, and strategic insights</SubText>
        </HeaderLeft>
        <PeriodSelector defaultValue="ytd">
          <option value="ytd">Year to Date</option>
          <option value="q1">Q1 2026</option>
          <option value="2025">Full Year 2025</option>
        </PeriodSelector>
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
            <StatChange positive={stat.positive}>
              {stat.positive ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
              {stat.change}
            </StatChange>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentGrid>
        <div>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconAward size={18} />
                Agent Leaderboard
              </SectionTitle>
              <ViewAllButton>
                View All <IconArrowRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            <LeaderboardList>
              {leaderboard.map((agent) => (
                <LeaderboardItem key={agent.rank} rank={agent.rank}>
                  <RankBadge rank={agent.rank}>{agent.rank}</RankBadge>
                  <AgentAvatar color={agent.color}>{agent.initials}</AgentAvatar>
                  <AgentInfo>
                    <AgentName>{agent.name}</AgentName>
                    <AgentRole>{agent.role}</AgentRole>
                  </AgentInfo>
                  <AgentStats>
                    <AgentStat>
                      <AgentStatValue>{agent.transactions}</AgentStatValue>
                      <AgentStatLabel>Transactions</AgentStatLabel>
                    </AgentStat>
                    <AgentStat>
                      <AgentStatValue>{agent.volume}</AgentStatValue>
                      <AgentStatLabel>Volume</AgentStatLabel>
                    </AgentStat>
                    <AgentStat>
                      <AgentStatValue>{agent.commission}</AgentStatValue>
                      <AgentStatLabel>Commission</AgentStatLabel>
                    </AgentStat>
                  </AgentStats>
                </LeaderboardItem>
              ))}
            </LeaderboardList>
          </Section>

          <Section style={{ marginTop: 24 }}>
            <SectionHeader>
              <SectionTitle>
                <IconHome size={18} />
                Top Deals This Month
              </SectionTitle>
            </SectionHeader>
            <TopDealsSection>
              {topDeals.map((deal, index) => (
                <DealItem key={index}>
                  <DealIcon>
                    <IconHome size={20} />
                  </DealIcon>
                  <DealDetails>
                    <DealAddress>{deal.address}</DealAddress>
                    <DealMeta>
                      {deal.city} • {deal.agent}
                    </DealMeta>
                  </DealDetails>
                  <div style={{ textAlign: 'right' }}>
                    <DealValue>{deal.value}</DealValue>
                    <DealCommission>{deal.commission} commission</DealCommission>
                  </div>
                </DealItem>
              ))}
            </TopDealsSection>
          </Section>
        </div>

        <RightColumn>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconTarget size={18} />
                Goals Progress
              </SectionTitle>
            </SectionHeader>
            <GoalProgress>
              {goals.map((goal, index) => (
                <GoalItem key={index}>
                  <GoalHeader>
                    <GoalLabel>{goal.label}</GoalLabel>
                    <GoalValue>
                      {goal.current} / {goal.target}
                    </GoalValue>
                  </GoalHeader>
                  <ProgressBar>
                    <ProgressFill progress={goal.progress} color={goal.color} />
                  </ProgressBar>
                </GoalItem>
              ))}
            </GoalProgress>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconChartBar size={18} />
                Company Metrics
              </SectionTitle>
            </SectionHeader>
            <MetricCard>
              {companyMetrics.map((metric, index) => (
                <MetricRow key={index}>
                  <MetricLabel>{metric.label}</MetricLabel>
                  <MetricValue>{metric.value}</MetricValue>
                </MetricRow>
              ))}
            </MetricCard>
          </Section>
        </RightColumn>
      </ContentGrid>
    </Container>
  );
};
