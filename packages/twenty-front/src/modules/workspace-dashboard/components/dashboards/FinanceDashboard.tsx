import styled from '@emotion/styled';
import {
  IconCash,
  IconReceipt,
  IconUsers,
  IconBriefcase,
  IconChartBar,
  IconArrowRight,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconFileCheck,
  IconDownload,
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

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
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

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
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
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const FullWidthSection = styled.div`
  grid-column: 1 / -1;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  overflow: hidden;
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

const CommissionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const CommissionTableHeader = styled.thead`
  background: ${({ theme }) => theme.background.tertiary};
`;

const CommissionTableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CommissionTableBody = styled.tbody``;

const CommissionTableRow = styled.tr`
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

const CommissionTableCell = styled.td`
  padding: 14px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const AgentCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AgentAvatar = styled.div<{ color: string }>`
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

const AgentInfo = styled.div``;

const AgentName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const AgentRole = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const AmountCell = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ status }) =>
    status === 'paid'
      ? '#10B98115'
      : status === 'pending'
        ? '#F59E0B15'
        : status === 'processing'
          ? '#3B82F615'
          : '#6B728015'};
  color: ${({ status }) =>
    status === 'paid'
      ? '#10B981'
      : status === 'pending'
        ? '#F59E0B'
        : status === 'processing'
          ? '#3B82F6'
          : '#6B7280'};
`;

const ExpenseList = styled.div`
  padding: 0;
`;

const ExpenseItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const ExpenseIcon = styled.div<{ category: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${({ category }) =>
    category === 'marketing'
      ? '#EC489915'
      : category === 'software'
        ? '#3B82F615'
        : category === 'office'
          ? '#F59E0B15'
          : '#10B98115'};
  color: ${({ category }) =>
    category === 'marketing'
      ? '#EC4899'
      : category === 'software'
        ? '#3B82F6'
        : category === 'office'
          ? '#F59E0B'
          : '#10B981'};
`;

const ExpenseDetails = styled.div`
  flex: 1;
`;

const ExpenseTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ExpenseCategory = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const ExpenseAmount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ExpenseDate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
`;

const SummaryCard = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 10px;
  text-align: center;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-bottom: 8px;
`;

const SummaryValue = styled.div<{ color?: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${({ color, theme }) => color || theme.font.color.primary};
`;

const PayrollList = styled.div`
  padding: 0;
`;

const PayrollItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const PayrollInfo = styled.div`
  flex: 1;
`;

const PayrollTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const PayrollDate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const PayrollAmount = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

// Mock data
const stats = [
  { label: 'Revenue MTD', value: '$487K', change: '+18.2% vs last month', positive: true, color: '#10B981', icon: IconCash },
  { label: 'Expenses MTD', value: '$124K', change: '+5.4% vs last month', positive: false, color: '#EF4444', icon: IconReceipt },
  { label: 'Net Profit', value: '$363K', change: '+22.1% vs last month', positive: true, color: '#3B82F6', icon: IconChartBar },
  { label: 'Transactions Closed', value: 28, change: '+7 vs last month', positive: true, color: '#8B5CF6', icon: IconBriefcase },
];

const commissions = [
  { id: 1, agent: 'Sarah Johnson', role: 'Senior Agent', property: '4521 Oak Haven Drive', amount: '$14,550', status: 'paid', date: 'Jan 20', initials: 'SJ', color: '#3B82F6' },
  { id: 2, agent: 'Michael Chen', role: 'Agent', property: '892 Maple Creek Lane', amount: '$9,750', status: 'processing', date: 'Jan 25', initials: 'MC', color: '#10B981' },
  { id: 3, agent: 'Emily Davis', role: 'Agent', property: '1156 Sunset Boulevard', amount: '$20,250', status: 'pending', date: 'Feb 1', initials: 'ED', color: '#F59E0B' },
  { id: 4, agent: 'James Wilson', role: 'Junior Agent', property: '2890 Willow Springs', amount: '$12,360', status: 'pending', date: 'Feb 5', initials: 'JW', color: '#8B5CF6' },
];

const expenses = [
  { id: 1, title: 'Google Ads Campaign', category: 'marketing', amount: '$4,500', date: 'Jan 22' },
  { id: 2, title: 'CRM Subscription', category: 'software', amount: '$299', date: 'Jan 15' },
  { id: 3, title: 'Office Supplies', category: 'office', amount: '$156', date: 'Jan 18' },
  { id: 4, title: 'Team Training', category: 'other', amount: '$1,200', date: 'Jan 20' },
];

const payroll = [
  { title: 'January Payroll', date: 'Due Jan 31', amount: '$48,750' },
  { title: 'TC Bonuses', date: 'Due Jan 31', amount: '$3,200' },
  { title: 'Admin Salaries', date: 'Paid Jan 15', amount: '$12,400' },
];

export const FinanceDashboard = () => {
  return (
    <Container>
      <Header>
        <HeaderLeft>
          <WelcomeText>Finance Dashboard</WelcomeText>
          <SubText>Commission tracking, expenses, and financial reporting</SubText>
        </HeaderLeft>
        <HeaderActions>
          <PeriodSelector defaultValue="january">
            <option value="january">January 2026</option>
            <option value="december">December 2025</option>
            <option value="q4">Q4 2025</option>
            <option value="ytd">Year to Date</option>
          </PeriodSelector>
          <ExportButton>
            <IconDownload size={16} />
            Export
          </ExportButton>
        </HeaderActions>
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
        <FullWidthSection>
          <SectionHeader>
            <SectionTitle>
              <IconCash size={18} />
              Commission Payouts
            </SectionTitle>
            <ViewAllButton>
              View All <IconArrowRight size={14} />
            </ViewAllButton>
          </SectionHeader>
          <CommissionTable>
            <CommissionTableHeader>
              <tr>
                <CommissionTableHeaderCell>Agent</CommissionTableHeaderCell>
                <CommissionTableHeaderCell>Property</CommissionTableHeaderCell>
                <CommissionTableHeaderCell>Commission</CommissionTableHeaderCell>
                <CommissionTableHeaderCell>Status</CommissionTableHeaderCell>
                <CommissionTableHeaderCell>Date</CommissionTableHeaderCell>
              </tr>
            </CommissionTableHeader>
            <CommissionTableBody>
              {commissions.map((commission) => (
                <CommissionTableRow key={commission.id}>
                  <CommissionTableCell>
                    <AgentCell>
                      <AgentAvatar color={commission.color}>{commission.initials}</AgentAvatar>
                      <AgentInfo>
                        <AgentName>{commission.agent}</AgentName>
                        <AgentRole>{commission.role}</AgentRole>
                      </AgentInfo>
                    </AgentCell>
                  </CommissionTableCell>
                  <CommissionTableCell>{commission.property}</CommissionTableCell>
                  <CommissionTableCell>
                    <AmountCell>{commission.amount}</AmountCell>
                  </CommissionTableCell>
                  <CommissionTableCell>
                    <StatusBadge status={commission.status}>
                      {commission.status === 'paid'
                        ? 'Paid'
                        : commission.status === 'processing'
                          ? 'Processing'
                          : 'Pending'}
                    </StatusBadge>
                  </CommissionTableCell>
                  <CommissionTableCell>{commission.date}</CommissionTableCell>
                </CommissionTableRow>
              ))}
            </CommissionTableBody>
          </CommissionTable>
        </FullWidthSection>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconReceipt size={18} />
              Recent Expenses
            </SectionTitle>
            <ViewAllButton>
              View All <IconArrowRight size={14} />
            </ViewAllButton>
          </SectionHeader>
          <ExpenseList>
            {expenses.map((expense) => (
              <ExpenseItem key={expense.id}>
                <ExpenseIcon category={expense.category}>
                  <IconReceipt size={18} />
                </ExpenseIcon>
                <ExpenseDetails>
                  <ExpenseTitle>{expense.title}</ExpenseTitle>
                  <ExpenseCategory>{expense.category}</ExpenseCategory>
                </ExpenseDetails>
                <div style={{ textAlign: 'right' }}>
                  <ExpenseAmount>{expense.amount}</ExpenseAmount>
                  <ExpenseDate>{expense.date}</ExpenseDate>
                </div>
              </ExpenseItem>
            ))}
          </ExpenseList>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconUsers size={18} />
              Payroll
            </SectionTitle>
            <ViewAllButton>
              Manage <IconArrowRight size={14} />
            </ViewAllButton>
          </SectionHeader>
          <PayrollList>
            {payroll.map((item, index) => (
              <PayrollItem key={index}>
                <PayrollInfo>
                  <PayrollTitle>{item.title}</PayrollTitle>
                  <PayrollDate>{item.date}</PayrollDate>
                </PayrollInfo>
                <PayrollAmount>{item.amount}</PayrollAmount>
              </PayrollItem>
            ))}
          </PayrollList>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconChartBar size={18} />
              Monthly Summary
            </SectionTitle>
          </SectionHeader>
          <SummaryGrid>
            <SummaryCard>
              <SummaryLabel>Total Revenue</SummaryLabel>
              <SummaryValue color="#10B981">$487,250</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Total Expenses</SummaryLabel>
              <SummaryValue color="#EF4444">$124,155</SummaryValue>
            </SummaryCard>
            <SummaryCard>
              <SummaryLabel>Profit Margin</SummaryLabel>
              <SummaryValue color="#3B82F6">74.5%</SummaryValue>
            </SummaryCard>
          </SummaryGrid>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconCalendar size={18} />
              Upcoming Payments
            </SectionTitle>
          </SectionHeader>
          <div style={{ padding: 20 }}>
            <UpcomingPayment>
              <UpcomingPaymentIcon>
                <IconFileCheck size={18} />
              </UpcomingPaymentIcon>
              <UpcomingPaymentInfo>
                <UpcomingPaymentTitle>Agent Commissions</UpcomingPaymentTitle>
                <UpcomingPaymentDate>Due Feb 1, 2026</UpcomingPaymentDate>
              </UpcomingPaymentInfo>
              <UpcomingPaymentAmount>$42,360</UpcomingPaymentAmount>
            </UpcomingPayment>
            <UpcomingPayment>
              <UpcomingPaymentIcon>
                <IconReceipt size={18} />
              </UpcomingPaymentIcon>
              <UpcomingPaymentInfo>
                <UpcomingPaymentTitle>Office Rent</UpcomingPaymentTitle>
                <UpcomingPaymentDate>Due Feb 1, 2026</UpcomingPaymentDate>
              </UpcomingPaymentInfo>
              <UpcomingPaymentAmount>$8,500</UpcomingPaymentAmount>
            </UpcomingPayment>
            <UpcomingPayment>
              <UpcomingPaymentIcon>
                <IconUsers size={18} />
              </UpcomingPaymentIcon>
              <UpcomingPaymentInfo>
                <UpcomingPaymentTitle>Staff Payroll</UpcomingPaymentTitle>
                <UpcomingPaymentDate>Due Feb 15, 2026</UpcomingPaymentDate>
              </UpcomingPaymentInfo>
              <UpcomingPaymentAmount>$24,600</UpcomingPaymentAmount>
            </UpcomingPayment>
          </div>
        </Section>
      </ContentGrid>
    </Container>
  );
};

const UpcomingPayment = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const UpcomingPaymentIcon = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 8px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const UpcomingPaymentInfo = styled.div`
  flex: 1;
`;

const UpcomingPaymentTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const UpcomingPaymentDate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const UpcomingPaymentAmount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;
