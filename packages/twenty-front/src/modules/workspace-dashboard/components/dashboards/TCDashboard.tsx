import styled from '@emotion/styled';
import {
    IconAlertTriangle,
    IconArrowRight,
    IconCalendar,
    IconChecklist,
    IconClock,
    IconFileCheck,
    IconFilter,
    IconHome,
    IconSearch,
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

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
  color: ${({ theme }) => theme.font.color.tertiary};
  width: 280px;
`;

const SearchPlaceholder = styled.span`
  font-size: 14px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 14px;
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

const StatSubtext = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  overflow: hidden;
`;

const FullWidthSection = styled(Section)`
  grid-column: 1 / -1;
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

const DeadlineList = styled.div`
  padding: 0;
`;

const DeadlineItem = styled.div<{ urgency: string }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  transition: background 0.15s;
  border-left: 4px solid
    ${({ urgency }) =>
      urgency === 'overdue'
        ? '#EF4444'
        : urgency === 'today'
          ? '#F59E0B'
          : urgency === 'soon'
            ? '#3B82F6'
            : '#10B981'};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const DeadlineIcon = styled.div<{ urgency: string }>`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: ${({ urgency }) =>
    urgency === 'overdue'
      ? '#EF444415'
      : urgency === 'today'
        ? '#F59E0B15'
        : urgency === 'soon'
          ? '#3B82F615'
          : '#10B98115'};
  color: ${({ urgency }) =>
    urgency === 'overdue'
      ? '#EF4444'
      : urgency === 'today'
        ? '#F59E0B'
        : urgency === 'soon'
          ? '#3B82F6'
          : '#10B981'};
`;

const DeadlineDetails = styled.div`
  flex: 1;
`;

const DeadlineTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 4px;
`;

const DeadlineMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DeadlineDate = styled.div<{ urgency: string }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ urgency }) =>
    urgency === 'overdue'
      ? '#EF4444'
      : urgency === 'today'
        ? '#F59E0B'
        : urgency === 'soon'
          ? '#3B82F6'
          : '#10B981'};
`;

const UrgencyBadge = styled.span<{ urgency: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ urgency }) =>
    urgency === 'overdue'
      ? '#EF444415'
      : urgency === 'today'
        ? '#F59E0B15'
        : urgency === 'soon'
          ? '#3B82F615'
          : '#10B98115'};
  color: ${({ urgency }) =>
    urgency === 'overdue'
      ? '#EF4444'
      : urgency === 'today'
        ? '#F59E0B'
        : urgency === 'soon'
          ? '#3B82F6'
          : '#10B981'};
`;

const FileTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const FileTableHeader = styled.thead`
  background: ${({ theme }) => theme.background.tertiary};
`;

const FileTableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FileTableBody = styled.tbody``;

const FileTableRow = styled.tr`
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

const FileTableCell = styled.td`
  padding: 14px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const PropertyCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PropertyIcon = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 8px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const PropertyInfo = styled.div``;

const PropertyAddress = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const PropertyCity = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const ProgressBar = styled.div`
  width: 100px;
  height: 6px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number; color: string }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: ${({ color }) => color};
  border-radius: 3px;
  transition: width 0.3s;
`;

const ProgressText = styled.span`
  margin-left: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ status }) =>
    status === 'on-track'
      ? '#10B98115'
      : status === 'at-risk'
        ? '#F59E0B15'
        : status === 'behind'
          ? '#EF444415'
          : '#6B728015'};
  color: ${({ status }) =>
    status === 'on-track'
      ? '#10B981'
      : status === 'at-risk'
        ? '#F59E0B'
        : status === 'behind'
          ? '#EF4444'
          : '#6B7280'};
`;

const ComplianceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
`;

const ComplianceCard = styled.div<{ status: string }>`
  padding: 16px;
  background: ${({ status }) =>
    status === 'complete'
      ? '#10B98108'
      : status === 'pending'
        ? '#F59E0B08'
        : '#EF444408'};
  border: 1px solid
    ${({ status }) =>
      status === 'complete'
        ? '#10B98130'
        : status === 'pending'
          ? '#F59E0B30'
          : '#EF444430'};
  border-radius: 10px;
`;

const ComplianceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ComplianceTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ComplianceIcon = styled.div<{ status: string }>`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: ${({ status }) =>
    status === 'complete'
      ? '#10B98120'
      : status === 'pending'
        ? '#F59E0B20'
        : '#EF444420'};
  color: ${({ status }) =>
    status === 'complete' ? '#10B981' : status === 'pending' ? '#F59E0B' : '#EF4444'};
`;

const ComplianceCount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ComplianceLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

// Mock data
const stats = [
  { label: 'Active Files', value: 28, subtext: '5 closing this week', color: '#8B5CF6', icon: IconFileCheck },
  { label: 'Deadlines Today', value: 6, subtext: '2 require immediate action', color: '#EF4444', icon: IconClock },
  { label: 'Compliance Items', value: 14, subtext: '3 pending review', color: '#F59E0B', icon: IconAlertTriangle },
  { label: 'Completed This Week', value: 23, subtext: 'Tasks and milestones', color: '#10B981', icon: IconChecklist },
];

const deadlines = [
  { id: 1, title: 'Option Period Expires', property: '4521 Oak Haven Drive', agent: 'Sarah Johnson', date: 'OVERDUE', urgency: 'overdue' },
  { id: 2, title: 'Earnest Money Due', property: '892 Maple Creek Lane', agent: 'Michael Chen', date: 'Today 5:00 PM', urgency: 'today' },
  { id: 3, title: 'Financing Contingency', property: '1156 Sunset Boulevard', agent: 'Emily Davis', date: 'Tomorrow', urgency: 'soon' },
  { id: 4, title: 'Final Walkthrough', property: '2890 Willow Springs', agent: 'James Wilson', date: 'Jan 28', urgency: 'upcoming' },
];

const files = [
  { id: 1, address: '4521 Oak Haven Drive', city: 'Austin, TX', agent: 'Sarah Johnson', progress: 75, status: 'on-track', closing: 'Feb 15' },
  { id: 2, address: '892 Maple Creek Lane', city: 'Round Rock, TX', agent: 'Michael Chen', progress: 92, status: 'on-track', closing: 'Jan 30' },
  { id: 3, address: '1156 Sunset Boulevard', city: 'Cedar Park, TX', agent: 'Emily Davis', progress: 45, status: 'at-risk', closing: 'Mar 1' },
  { id: 4, address: '2890 Willow Springs Rd', city: 'Leander, TX', agent: 'James Wilson', progress: 30, status: 'behind', closing: 'Feb 28' },
  { id: 5, address: '567 Riverside Drive', city: 'Pflugerville, TX', agent: 'Lisa Anderson', progress: 88, status: 'on-track', closing: 'Feb 5' },
];

const complianceStats = [
  { title: 'Completed', count: 156, status: 'complete' },
  { title: 'Pending', count: 14, status: 'pending' },
  { title: 'Missing', count: 3, status: 'missing' },
];

export const TCDashboard = () => {
  return (
    <Container>
      <Header>
        <HeaderLeft>
          <WelcomeText>Transaction Coordinator Dashboard</WelcomeText>
          <SubText>Managing 28 active files • 6 deadlines require attention today</SubText>
        </HeaderLeft>
        <HeaderActions>
          <SearchInput>
            <IconSearch size={16} />
            <SearchPlaceholder>Search files...</SearchPlaceholder>
          </SearchInput>
          <FilterButton>
            <IconFilter size={16} />
            Filter
          </FilterButton>
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
            <StatSubtext>{stat.subtext}</StatSubtext>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconClock size={18} />
              Upcoming Deadlines
            </SectionTitle>
            <ViewAllButton>
              View All <IconArrowRight size={14} />
            </ViewAllButton>
          </SectionHeader>
          <DeadlineList>
            {deadlines.map((deadline) => (
              <DeadlineItem key={deadline.id} urgency={deadline.urgency}>
                <DeadlineIcon urgency={deadline.urgency}>
                  <IconCalendar size={20} />
                </DeadlineIcon>
                <DeadlineDetails>
                  <DeadlineTitle>{deadline.title}</DeadlineTitle>
                  <DeadlineMeta>
                    <span>{deadline.property}</span>
                    <span>•</span>
                    <span>{deadline.agent}</span>
                  </DeadlineMeta>
                </DeadlineDetails>
                <DeadlineDate urgency={deadline.urgency}>{deadline.date}</DeadlineDate>
                <UrgencyBadge urgency={deadline.urgency}>
                  {deadline.urgency === 'overdue'
                    ? 'Overdue'
                    : deadline.urgency === 'today'
                      ? 'Due Today'
                      : deadline.urgency === 'soon'
                        ? 'Due Soon'
                        : 'Upcoming'}
                </UrgencyBadge>
              </DeadlineItem>
            ))}
          </DeadlineList>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconAlertTriangle size={18} />
              Compliance Overview
            </SectionTitle>
          </SectionHeader>
          <ComplianceGrid>
            {complianceStats.map((item, index) => (
              <ComplianceCard key={index} status={item.status}>
                <ComplianceHeader>
                  <ComplianceTitle>{item.title}</ComplianceTitle>
                  <ComplianceIcon status={item.status}>
                    <IconFileCheck size={14} />
                  </ComplianceIcon>
                </ComplianceHeader>
                <ComplianceCount>{item.count}</ComplianceCount>
                <ComplianceLabel>documents</ComplianceLabel>
              </ComplianceCard>
            ))}
          </ComplianceGrid>
        </Section>

        <FullWidthSection>
          <SectionHeader>
            <SectionTitle>
              <IconFileCheck size={18} />
              Active Transaction Files
            </SectionTitle>
            <ViewAllButton>
              View All <IconArrowRight size={14} />
            </ViewAllButton>
          </SectionHeader>
          <FileTable>
            <FileTableHeader>
              <tr>
                <FileTableHeaderCell>Property</FileTableHeaderCell>
                <FileTableHeaderCell>Agent</FileTableHeaderCell>
                <FileTableHeaderCell>Progress</FileTableHeaderCell>
                <FileTableHeaderCell>Status</FileTableHeaderCell>
                <FileTableHeaderCell>Closing Date</FileTableHeaderCell>
              </tr>
            </FileTableHeader>
            <FileTableBody>
              {files.map((file) => (
                <FileTableRow key={file.id}>
                  <FileTableCell>
                    <PropertyCell>
                      <PropertyIcon>
                        <IconHome size={18} />
                      </PropertyIcon>
                      <PropertyInfo>
                        <PropertyAddress>{file.address}</PropertyAddress>
                        <PropertyCity>{file.city}</PropertyCity>
                      </PropertyInfo>
                    </PropertyCell>
                  </FileTableCell>
                  <FileTableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconUsers size={16} />
                      {file.agent}
                    </div>
                  </FileTableCell>
                  <FileTableCell>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <ProgressBar>
                        <ProgressFill
                          progress={file.progress}
                          color={
                            file.progress >= 80 ? '#10B981' : file.progress >= 50 ? '#F59E0B' : '#EF4444'
                          }
                        />
                      </ProgressBar>
                      <ProgressText>{file.progress}%</ProgressText>
                    </div>
                  </FileTableCell>
                  <FileTableCell>
                    <StatusBadge status={file.status}>
                      {file.status === 'on-track'
                        ? 'On Track'
                        : file.status === 'at-risk'
                          ? 'At Risk'
                          : 'Behind'}
                    </StatusBadge>
                  </FileTableCell>
                  <FileTableCell>{file.closing}</FileTableCell>
                </FileTableRow>
              ))}
            </FileTableBody>
          </FileTable>
        </FullWidthSection>
      </ContentGrid>
    </Container>
  );
};
