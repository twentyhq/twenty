import styled from '@emotion/styled';
import {
    IconAlertCircle,
    IconArrowRight,
    IconBriefcase,
    IconCalendar,
    IconCash,
    IconChecklist,
    IconHome,
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

const TransactionList = styled.div`
  padding: 0;
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  transition: background 0.15s;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TransactionIcon = styled.div<{ status: string }>`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: ${({ status }) =>
    status === 'active'
      ? '#3B82F615'
      : status === 'pending'
        ? '#F59E0B15'
        : status === 'closing'
          ? '#10B98115'
          : '#6B728015'};
  color: ${({ status }) =>
    status === 'active'
      ? '#3B82F6'
      : status === 'pending'
        ? '#F59E0B'
        : status === 'closing'
          ? '#10B981'
          : '#6B7280'};
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionAddress = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 4px;
`;

const TransactionMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TransactionPrice = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  text-align: right;
`;

const TransactionCommission = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.blue};
  text-align: right;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ status }) =>
    status === 'active'
      ? '#3B82F615'
      : status === 'pending'
        ? '#F59E0B15'
        : status === 'closing'
          ? '#10B98115'
          : '#6B728015'};
  color: ${({ status }) =>
    status === 'active'
      ? '#3B82F6'
      : status === 'pending'
        ? '#F59E0B'
        : status === 'closing'
          ? '#10B981'
          : '#6B7280'};
`;

const TaskList = styled.div`
  padding: 0;
`;

const TaskItem = styled.div<{ priority: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }

  &:last-child {
    border-bottom: none;
  }

  border-left: 3px solid
    ${({ priority }) =>
      priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#10B981'};
`;

const TaskCheckbox = styled.div<{ completed: boolean }>`
  width: 18px;
  height: 18px;
  border: 2px solid
    ${({ completed, theme }) => (completed ? theme.color.blue : theme.border.color.medium)};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ completed, theme }) => (completed ? theme.color.blue : 'transparent')};
  color: white;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const TaskContent = styled.div`
  flex: 1;
`;

const TaskTitle = styled.div<{ completed: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme, completed }) =>
    completed ? theme.font.color.tertiary : theme.font.color.primary};
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
  margin-bottom: 4px;
`;

const TaskMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const CalendarPreview = styled.div`
  padding: 16px 20px;
`;

const CalendarDay = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const CalendarDate = styled.div`
  width: 44px;
  height: 44px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CalendarMonth = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  font-weight: 600;
`;

const CalendarDateNum = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const CalendarEvent = styled.div`
  flex: 1;
`;

const CalendarEventTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const CalendarEventTime = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const AlertsSection = styled.div`
  padding: 0;
`;

const AlertItem = styled.div<{ type: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  background: ${({ type }) => (type === 'urgent' ? '#FEF2F215' : type === 'warning' ? '#FEF3C715' : '#F0F9FF15')};
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
  { label: 'Active Transactions', value: 12, change: '+2 this week', positive: true, color: '#3B82F6', icon: IconBriefcase },
  { label: 'Pending Closings', value: 4, change: '3 this month', positive: true, color: '#10B981', icon: IconHome },
  { label: 'YTD Commission', value: '$127,450', change: '+18% vs last year', positive: true, color: '#F59E0B', icon: IconCash },
  { label: 'Tasks Due Today', value: 7, change: '3 high priority', positive: false, color: '#EF4444', icon: IconChecklist },
];

const transactions = [
  { id: 1, address: '4521 Oak Haven Drive', city: 'Austin, TX', price: '$485,000', commission: '$14,550', status: 'active', client: 'Sarah Johnson', closingDate: 'Feb 15, 2026' },
  { id: 2, address: '892 Maple Creek Lane', city: 'Round Rock, TX', price: '$325,000', commission: '$9,750', status: 'closing', client: 'Michael Chen', closingDate: 'Jan 30, 2026' },
  { id: 3, address: '1156 Sunset Boulevard', city: 'Cedar Park, TX', price: '$675,000', commission: '$20,250', status: 'pending', client: 'David & Lisa Thompson', closingDate: 'Mar 1, 2026' },
  { id: 4, address: '2890 Willow Springs Rd', city: 'Leander, TX', price: '$412,000', commission: '$12,360', status: 'active', client: 'Emma Rodriguez', closingDate: 'Feb 28, 2026' },
];

const tasks = [
  { id: 1, title: 'Submit Option Period extension request', property: '4521 Oak Haven', priority: 'high', dueDate: 'Today', completed: false },
  { id: 2, title: 'Schedule final walkthrough', property: '892 Maple Creek', priority: 'high', dueDate: 'Today', completed: false },
  { id: 3, title: 'Review inspection report with buyers', property: '1156 Sunset Blvd', priority: 'medium', dueDate: 'Tomorrow', completed: false },
  { id: 4, title: 'Send updated CMA to sellers', property: '2890 Willow Springs', priority: 'low', dueDate: 'Jan 28', completed: true },
];

const upcomingEvents = [
  { date: 25, month: 'Jan', title: 'Showing - 4521 Oak Haven', time: '2:00 PM - 3:00 PM' },
  { date: 26, month: 'Jan', title: 'Closing - 892 Maple Creek', time: '10:00 AM' },
  { date: 27, month: 'Jan', title: 'Listing Appointment', time: '4:30 PM' },
];

const alerts = [
  { type: 'urgent', title: 'Option Period Expires Tomorrow', message: '4521 Oak Haven - Extension not submitted' },
  { type: 'warning', title: 'Appraisal Scheduled', message: '1156 Sunset Blvd - Jan 28 at 9:00 AM' },
  { type: 'info', title: 'New Lead Assigned', message: 'Website inquiry - John Smith interested in Cedar Park' },
];

export const AgentDashboard = () => {
  return (
    <Container>
      <Header>
        <WelcomeText>Welcome back, Agent! 👋</WelcomeText>
        <SubText>Here&apos;s what&apos;s happening with your transactions today.</SubText>
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
                <IconBriefcase size={18} />
                Active Transactions
              </SectionTitle>
              <ViewAllButton>
                View All <IconArrowRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            <TransactionList>
              {transactions.map((txn) => (
                <TransactionItem key={txn.id}>
                  <TransactionIcon status={txn.status}>
                    <IconHome size={20} />
                  </TransactionIcon>
                  <TransactionDetails>
                    <TransactionAddress>{txn.address}</TransactionAddress>
                    <TransactionMeta>
                      <span>{txn.city}</span>
                      <span>•</span>
                      <span>{txn.client}</span>
                      <span>•</span>
                      <span>Closing: {txn.closingDate}</span>
                    </TransactionMeta>
                  </TransactionDetails>
                  <div>
                    <TransactionPrice>{txn.price}</TransactionPrice>
                    <TransactionCommission>{txn.commission}</TransactionCommission>
                  </div>
                  <StatusBadge status={txn.status}>
                    {txn.status === 'active' ? 'Active' : txn.status === 'closing' ? 'Closing Soon' : 'Pending'}
                  </StatusBadge>
                </TransactionItem>
              ))}
            </TransactionList>
          </Section>

          <Section style={{ marginTop: 24 }}>
            <SectionHeader>
              <SectionTitle>
                <IconChecklist size={18} />
                My Tasks
              </SectionTitle>
              <ViewAllButton>
                View All <IconArrowRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            <TaskList>
              {tasks.map((task) => (
                <TaskItem key={task.id} priority={task.priority}>
                  <TaskCheckbox completed={task.completed}>
                    {task.completed && '✓'}
                  </TaskCheckbox>
                  <TaskContent>
                    <TaskTitle completed={task.completed}>{task.title}</TaskTitle>
                    <TaskMeta>
                      <span>{task.property}</span>
                      <span>•</span>
                      <span>Due: {task.dueDate}</span>
                    </TaskMeta>
                  </TaskContent>
                </TaskItem>
              ))}
            </TaskList>
          </Section>
        </div>

        <RightColumn>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconCalendar size={18} />
                Upcoming
              </SectionTitle>
            </SectionHeader>
            <CalendarPreview>
              {upcomingEvents.map((event, index) => (
                <CalendarDay key={index}>
                  <CalendarDate>
                    <CalendarMonth>{event.month}</CalendarMonth>
                    <CalendarDateNum>{event.date}</CalendarDateNum>
                  </CalendarDate>
                  <CalendarEvent>
                    <CalendarEventTitle>{event.title}</CalendarEventTitle>
                    <CalendarEventTime>{event.time}</CalendarEventTime>
                  </CalendarEvent>
                </CalendarDay>
              ))}
            </CalendarPreview>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconAlertCircle size={18} />
                Alerts
              </SectionTitle>
            </SectionHeader>
            <AlertsSection>
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
            </AlertsSection>
          </Section>
        </RightColumn>
      </ContentGrid>
    </Container>
  );
};
