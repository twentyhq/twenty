import styled from '@emotion/styled';
import {
    IconAlertCircle,
    IconArrowRight,
    IconBuildingBank,
    IconCalendar,
    IconCash,
    IconFileCheck,
    IconLock,
    IconPercentage,
    IconTrendingUp
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

const LoanList = styled.div`
  padding: 0;
`;

const LoanItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
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

const LoanIcon = styled.div<{ stage: string }>`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: ${({ stage }) =>
    stage === 'application'
      ? '#3B82F615'
      : stage === 'processing'
        ? '#8B5CF615'
        : stage === 'underwriting'
          ? '#F59E0B15'
          : stage === 'clear-to-close'
            ? '#10B98115'
            : '#6B728015'};
  color: ${({ stage }) =>
    stage === 'application'
      ? '#3B82F6'
      : stage === 'processing'
        ? '#8B5CF6'
        : stage === 'underwriting'
          ? '#F59E0B'
          : stage === 'clear-to-close'
            ? '#10B981'
            : '#6B7280'};
`;

const LoanDetails = styled.div`
  flex: 1;
`;

const LoanBorrower = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 4px;
`;

const LoanMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LoanAmount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  text-align: right;
`;

const LoanRate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.blue};
  text-align: right;
`;

const StageBadge = styled.span<{ stage: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ stage }) =>
    stage === 'application'
      ? '#3B82F615'
      : stage === 'processing'
        ? '#8B5CF615'
        : stage === 'underwriting'
          ? '#F59E0B15'
          : stage === 'clear-to-close'
            ? '#10B98115'
            : '#6B728015'};
  color: ${({ stage }) =>
    stage === 'application'
      ? '#3B82F6'
      : stage === 'processing'
        ? '#8B5CF6'
        : stage === 'underwriting'
          ? '#F59E0B'
          : stage === 'clear-to-close'
            ? '#10B981'
            : '#6B7280'};
`;

const RateLockSection = styled.div`
  padding: 0;
`;

const RateLockItem = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-left: 4px solid
    ${({ status }) =>
      status === 'locked'
        ? '#10B981'
        : status === 'expiring'
          ? '#F59E0B'
          : status === 'expired'
            ? '#EF4444'
            : '#6B7280'};

  &:last-child {
    border-bottom: none;
  }
`;

const RateLockIcon = styled.div<{ status: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${({ status }) =>
    status === 'locked'
      ? '#10B98115'
      : status === 'expiring'
        ? '#F59E0B15'
        : status === 'expired'
          ? '#EF444415'
          : '#6B728015'};
  color: ${({ status }) =>
    status === 'locked'
      ? '#10B981'
      : status === 'expiring'
        ? '#F59E0B'
        : status === 'expired'
          ? '#EF4444'
          : '#6B7280'};
`;

const RateLockDetails = styled.div`
  flex: 1;
`;

const RateLockBorrower = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 2px;
`;

const RateLockInfo = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const RateLockRate = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const RateLockExpiry = styled.div<{ status: string }>`
  font-size: 11px;
  color: ${({ status }) =>
    status === 'locked' ? '#10B981' : status === 'expiring' ? '#F59E0B' : '#EF4444'};
  font-weight: 600;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PipelineStages = styled.div`
  padding: 20px;
`;

const PipelineStage = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const StageIndicator = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const StageInfo = styled.div`
  flex: 1;
`;

const StageName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StageCount = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StageValue = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-align: right;
`;

const AlertList = styled.div`
  padding: 0;
`;

const AlertItem = styled.div<{ type: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  border-left: 3px solid
    ${({ type }) => (type === 'urgent' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6')};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const AlertIcon = styled.div<{ type: string }>`
  color: ${({ type }) => (type === 'urgent' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6')};
  flex-shrink: 0;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 2px;
`;

const AlertMessage = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

// Mock data
const stats = [
  { label: 'Active Loans', value: 34, change: '+5 this month', positive: true, color: '#10B981', icon: IconBuildingBank },
  { label: 'Pending Closings', value: 8, change: 'Next 30 days', positive: true, color: '#3B82F6', icon: IconCalendar },
  { label: 'Rate Locks Expiring', value: 3, change: 'Within 7 days', positive: false, color: '#F59E0B', icon: IconLock },
  { label: 'Pipeline Value', value: '$12.4M', change: '+22% vs last month', positive: true, color: '#8B5CF6', icon: IconCash },
];

const loans = [
  { id: 1, borrower: 'Sarah & Michael Johnson', property: '4521 Oak Haven Drive', amount: '$388,000', rate: '6.25%', stage: 'clear-to-close', closingDate: 'Feb 15' },
  { id: 2, borrower: 'David Chen', property: '892 Maple Creek Lane', amount: '$260,000', rate: '6.50%', stage: 'underwriting', closingDate: 'Jan 30' },
  { id: 3, borrower: 'Emily Rodriguez', property: '1156 Sunset Boulevard', amount: '$540,000', rate: '6.375%', stage: 'processing', closingDate: 'Mar 1' },
  { id: 4, borrower: 'James Wilson', property: '2890 Willow Springs Rd', amount: '$329,600', rate: '6.625%', stage: 'application', closingDate: 'Feb 28' },
];

const rateLocks = [
  { id: 1, borrower: 'Sarah Johnson', rate: '6.25%', expires: '30 days', status: 'locked' },
  { id: 2, borrower: 'David Chen', rate: '6.50%', expires: '5 days', status: 'expiring' },
  { id: 3, borrower: 'Lisa Thompson', rate: '6.375%', expires: 'Expired', status: 'expired' },
];

const pipelineStages = [
  { name: 'Application', count: 8, value: '$2.8M', color: '#3B82F6' },
  { name: 'Processing', count: 12, value: '$4.2M', color: '#8B5CF6' },
  { name: 'Underwriting', count: 9, value: '$3.1M', color: '#F59E0B' },
  { name: 'Clear to Close', count: 5, value: '$2.3M', color: '#10B981' },
];

const alerts = [
  { type: 'urgent', title: 'Rate Lock Expired', message: 'Lisa Thompson - needs immediate action' },
  { type: 'warning', title: 'Documents Needed', message: 'David Chen - 2 conditions outstanding' },
  { type: 'info', title: 'Appraisal Completed', message: 'Sarah Johnson - came in at value' },
];

export const MortgageDashboard = () => {
  return (
    <Container>
      <Header>
        <WelcomeText>Mortgage Dashboard</WelcomeText>
        <SubText>Tracking 34 active loans with $12.4M in pipeline value</SubText>
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
              <IconTrendingUp size={14} />
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
                <IconBuildingBank size={18} />
                Loan Pipeline
              </SectionTitle>
              <ViewAllButton>
                View All <IconArrowRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            <LoanList>
              {loans.map((loan) => (
                <LoanItem key={loan.id}>
                  <LoanIcon stage={loan.stage}>
                    <IconFileCheck size={20} />
                  </LoanIcon>
                  <LoanDetails>
                    <LoanBorrower>{loan.borrower}</LoanBorrower>
                    <LoanMeta>
                      <span>{loan.property}</span>
                      <span>•</span>
                      <span>Closing: {loan.closingDate}</span>
                    </LoanMeta>
                  </LoanDetails>
                  <div>
                    <LoanAmount>{loan.amount}</LoanAmount>
                    <LoanRate>{loan.rate}</LoanRate>
                  </div>
                  <StageBadge stage={loan.stage}>
                    {loan.stage === 'application'
                      ? 'Application'
                      : loan.stage === 'processing'
                        ? 'Processing'
                        : loan.stage === 'underwriting'
                          ? 'Underwriting'
                          : 'Clear to Close'}
                  </StageBadge>
                </LoanItem>
              ))}
            </LoanList>
          </Section>

          <Section style={{ marginTop: 24 }}>
            <SectionHeader>
              <SectionTitle>
                <IconLock size={18} />
                Rate Locks
              </SectionTitle>
              <ViewAllButton>
                Manage <IconArrowRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            <RateLockSection>
              {rateLocks.map((lock) => (
                <RateLockItem key={lock.id} status={lock.status}>
                  <RateLockIcon status={lock.status}>
                    <IconLock size={18} />
                  </RateLockIcon>
                  <RateLockDetails>
                    <RateLockBorrower>{lock.borrower}</RateLockBorrower>
                    <RateLockInfo>
                      {lock.status === 'locked'
                        ? 'Locked & Secured'
                        : lock.status === 'expiring'
                          ? 'Expiring Soon!'
                          : 'Needs Re-lock'}
                    </RateLockInfo>
                  </RateLockDetails>
                  <div style={{ textAlign: 'right' }}>
                    <RateLockRate>{lock.rate}</RateLockRate>
                    <RateLockExpiry status={lock.status}>{lock.expires}</RateLockExpiry>
                  </div>
                </RateLockItem>
              ))}
            </RateLockSection>
          </Section>
        </div>

        <RightColumn>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconPercentage size={18} />
                Pipeline by Stage
              </SectionTitle>
            </SectionHeader>
            <PipelineStages>
              {pipelineStages.map((stage, index) => (
                <PipelineStage key={index}>
                  <StageIndicator color={stage.color} />
                  <StageInfo>
                    <StageName>{stage.name}</StageName>
                  </StageInfo>
                  <StageCount>{stage.count}</StageCount>
                  <StageValue>{stage.value}</StageValue>
                </PipelineStage>
              ))}
            </PipelineStages>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconAlertCircle size={18} />
                Alerts
              </SectionTitle>
            </SectionHeader>
            <AlertList>
              {alerts.map((alert, index) => (
                <AlertItem key={index} type={alert.type}>
                  <AlertIcon type={alert.type}>
                    <IconAlertCircle size={16} />
                  </AlertIcon>
                  <AlertContent>
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertMessage>{alert.message}</AlertMessage>
                  </AlertContent>
                </AlertItem>
              ))}
            </AlertList>
          </Section>
        </RightColumn>
      </ContentGrid>
    </Container>
  );
};
