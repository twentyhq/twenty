import styled from '@emotion/styled';
import {
    IconAlertCircle,
    IconArrowRight,
    IconCalendar,
    IconCash,
    IconHome,
    IconKey,
    IconPhone,
    IconTools,
    IconTrendingUp,
    IconUsers
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

const PropertyTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const PropertyTableHeader = styled.thead`
  background: ${({ theme }) => theme.background.tertiary};
`;

const PropertyTableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PropertyTableBody = styled.tbody``;

const PropertyTableRow = styled.tr`
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

const PropertyTableCell = styled.td`
  padding: 14px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const PropertyCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PropertyIcon = styled.div<{ status: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ status }) =>
    status === 'occupied' ? '#10B98115' : status === 'vacant' ? '#F59E0B15' : '#3B82F615'};
  border-radius: 8px;
  color: ${({ status }) =>
    status === 'occupied' ? '#10B981' : status === 'vacant' ? '#F59E0B' : '#3B82F6'};
`;

const PropertyInfo = styled.div``;

const PropertyAddress = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const PropertyType = styled.div`
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
    status === 'occupied'
      ? '#10B98115'
      : status === 'vacant'
        ? '#F59E0B15'
        : status === 'maintenance'
          ? '#EF444415'
          : '#3B82F615'};
  color: ${({ status }) =>
    status === 'occupied'
      ? '#10B981'
      : status === 'vacant'
        ? '#F59E0B'
        : status === 'maintenance'
          ? '#EF4444'
          : '#3B82F6'};
`;

const MaintenanceList = styled.div`
  padding: 0;
`;

const MaintenanceItem = styled.div<{ priority: string }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-left: 4px solid
    ${({ priority }) =>
      priority === 'urgent' ? '#EF4444' : priority === 'high' ? '#F59E0B' : '#10B981'};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MaintenanceIcon = styled.div<{ priority: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: ${({ priority }) =>
    priority === 'urgent' ? '#EF444415' : priority === 'high' ? '#F59E0B15' : '#10B98115'};
  color: ${({ priority }) =>
    priority === 'urgent' ? '#EF4444' : priority === 'high' ? '#F59E0B' : '#10B981'};
`;

const MaintenanceDetails = styled.div`
  flex: 1;
`;

const MaintenanceTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 4px;
`;

const MaintenanceMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const MaintenanceStatus = styled.div`
  text-align: right;
`;

const MaintenanceDate = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const MaintenanceAssignee = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const LeaseList = styled.div`
  padding: 0;
`;

const LeaseItem = styled.div<{ expiring: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  background: ${({ expiring }) => (expiring ? '#FEF3C708' : 'transparent')};
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const LeaseIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 8px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const LeaseDetails = styled.div`
  flex: 1;
`;

const LeaseTenant = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 4px;
`;

const LeaseProperty = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const LeaseExpiry = styled.div<{ expiring: boolean }>`
  text-align: right;
`;

const LeaseDate = styled.div<{ expiring: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ expiring }) => (expiring ? '#F59E0B' : '#10B981')};
`;

const LeaseRent = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const RentCollection = styled.div`
  padding: 20px;
`;

const RentProgress = styled.div`
  margin-bottom: 20px;
`;

const RentProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const RentProgressLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const RentProgressValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.blue};
`;

const ProgressBar = styled.div`
  height: 10px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: linear-gradient(90deg, #10B981 0%, #3B82F6 100%);
  border-radius: 5px;
  transition: width 0.3s;
`;

const RentStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const RentStatCard = styled.div`
  text-align: center;
  padding: 12px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 8px;
`;

const RentStatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const RentStatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-top: 4px;
`;

// Mock data
const stats = [
  { label: 'Total Properties', value: 48, change: '+3 this month', positive: true, color: '#F59E0B', icon: IconHome },
  { label: 'Active Tenants', value: 142, change: '96% occupancy', positive: true, color: '#10B981', icon: IconUsers },
  { label: 'Open Work Orders', value: 12, change: '3 urgent', positive: false, color: '#EF4444', icon: IconTools },
  { label: 'Monthly Revenue', value: '$284K', change: '+8% vs last month', positive: true, color: '#3B82F6', icon: IconCash },
];

const properties = [
  { id: 1, address: '4521 Oak Haven Drive', type: 'Single Family', units: 1, tenant: 'Johnson Family', rent: '$2,450', status: 'occupied' },
  { id: 2, address: 'Maple Creek Apartments', type: 'Multi-Family', units: 12, tenant: '11 tenants', rent: '$18,600', status: 'occupied' },
  { id: 3, address: '892 Willow Springs', type: 'Single Family', units: 1, tenant: '-', rent: '$2,100', status: 'vacant' },
  { id: 4, address: 'Sunset Plaza', type: 'Commercial', units: 4, tenant: '3 businesses', rent: '$12,400', status: 'occupied' },
  { id: 5, address: '567 Riverside Condo', type: 'Condo', units: 1, tenant: 'David Chen', rent: '$1,850', status: 'maintenance' },
];

const maintenanceRequests = [
  { id: 1, title: 'HVAC Not Working', property: '4521 Oak Haven', tenant: 'Johnson Family', priority: 'urgent', date: 'Today', assignee: 'Mike\'s HVAC' },
  { id: 2, title: 'Leaking Faucet', property: 'Maple Creek #204', tenant: 'Sarah Williams', priority: 'high', date: 'Jan 26', assignee: 'In-house' },
  { id: 3, title: 'Replace Smoke Detectors', property: 'Sunset Plaza #2', tenant: 'ABC Corp', priority: 'normal', date: 'Jan 28', assignee: 'In-house' },
];

const expiringLeases = [
  { id: 1, tenant: 'Johnson Family', property: '4521 Oak Haven Drive', expires: 'Feb 28, 2026', rent: '$2,450/mo', expiring: true },
  { id: 2, tenant: 'Sarah Williams', property: 'Maple Creek #204', expires: 'Mar 15, 2026', rent: '$1,650/mo', expiring: true },
  { id: 3, tenant: 'David Chen', property: '567 Riverside Condo', expires: 'Jun 1, 2026', rent: '$1,850/mo', expiring: false },
];

export const PropertyManagementDashboard = () => {
  return (
    <Container>
      <Header>
        <WelcomeText>Property Management Dashboard</WelcomeText>
        <SubText>Managing 48 properties with 142 active tenants</SubText>
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
        <FullWidthSection>
          <SectionHeader>
            <SectionTitle>
              <IconHome size={18} />
              Properties Overview
            </SectionTitle>
            <ViewAllButton>
              View All <IconArrowRight size={14} />
            </ViewAllButton>
          </SectionHeader>
          <PropertyTable>
            <PropertyTableHeader>
              <tr>
                <PropertyTableHeaderCell>Property</PropertyTableHeaderCell>
                <PropertyTableHeaderCell>Units</PropertyTableHeaderCell>
                <PropertyTableHeaderCell>Tenant</PropertyTableHeaderCell>
                <PropertyTableHeaderCell>Monthly Rent</PropertyTableHeaderCell>
                <PropertyTableHeaderCell>Status</PropertyTableHeaderCell>
              </tr>
            </PropertyTableHeader>
            <PropertyTableBody>
              {properties.map((property) => (
                <PropertyTableRow key={property.id}>
                  <PropertyTableCell>
                    <PropertyCell>
                      <PropertyIcon status={property.status}>
                        <IconHome size={18} />
                      </PropertyIcon>
                      <PropertyInfo>
                        <PropertyAddress>{property.address}</PropertyAddress>
                        <PropertyType>{property.type}</PropertyType>
                      </PropertyInfo>
                    </PropertyCell>
                  </PropertyTableCell>
                  <PropertyTableCell>{property.units}</PropertyTableCell>
                  <PropertyTableCell>{property.tenant}</PropertyTableCell>
                  <PropertyTableCell style={{ fontWeight: 600 }}>{property.rent}</PropertyTableCell>
                  <PropertyTableCell>
                    <StatusBadge status={property.status}>
                      {property.status === 'occupied'
                        ? 'Occupied'
                        : property.status === 'vacant'
                          ? 'Vacant'
                          : 'Maintenance'}
                    </StatusBadge>
                  </PropertyTableCell>
                </PropertyTableRow>
              ))}
            </PropertyTableBody>
          </PropertyTable>
        </FullWidthSection>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconTools size={18} />
              Maintenance Requests
            </SectionTitle>
            <ViewAllButton>
              View All <IconArrowRight size={14} />
            </ViewAllButton>
          </SectionHeader>
          <MaintenanceList>
            {maintenanceRequests.map((request) => (
              <MaintenanceItem key={request.id} priority={request.priority}>
                <MaintenanceIcon priority={request.priority}>
                  <IconTools size={18} />
                </MaintenanceIcon>
                <MaintenanceDetails>
                  <MaintenanceTitle>{request.title}</MaintenanceTitle>
                  <MaintenanceMeta>
                    {request.property} • {request.tenant}
                  </MaintenanceMeta>
                </MaintenanceDetails>
                <MaintenanceStatus>
                  <MaintenanceDate>{request.date}</MaintenanceDate>
                  <MaintenanceAssignee>{request.assignee}</MaintenanceAssignee>
                </MaintenanceStatus>
              </MaintenanceItem>
            ))}
          </MaintenanceList>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconCash size={18} />
              Rent Collection - January
            </SectionTitle>
          </SectionHeader>
          <RentCollection>
            <RentProgress>
              <RentProgressHeader>
                <RentProgressLabel>Collected</RentProgressLabel>
                <RentProgressValue>$248,400 / $284,000</RentProgressValue>
              </RentProgressHeader>
              <ProgressBar>
                <ProgressFill progress={87.5} />
              </ProgressBar>
            </RentProgress>
            <RentStats>
              <RentStatCard>
                <RentStatValue>128</RentStatValue>
                <RentStatLabel>Paid</RentStatLabel>
              </RentStatCard>
              <RentStatCard>
                <RentStatValue>11</RentStatValue>
                <RentStatLabel>Pending</RentStatLabel>
              </RentStatCard>
              <RentStatCard>
                <RentStatValue>3</RentStatValue>
                <RentStatLabel>Late</RentStatLabel>
              </RentStatCard>
            </RentStats>
          </RentCollection>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconCalendar size={18} />
              Expiring Leases
            </SectionTitle>
            <ViewAllButton>
              View All <IconArrowRight size={14} />
            </ViewAllButton>
          </SectionHeader>
          <LeaseList>
            {expiringLeases.map((lease) => (
              <LeaseItem key={lease.id} expiring={lease.expiring}>
                <LeaseIcon>
                  <IconKey size={18} />
                </LeaseIcon>
                <LeaseDetails>
                  <LeaseTenant>{lease.tenant}</LeaseTenant>
                  <LeaseProperty>{lease.property}</LeaseProperty>
                </LeaseDetails>
                <LeaseExpiry expiring={lease.expiring}>
                  <LeaseDate expiring={lease.expiring}>{lease.expires}</LeaseDate>
                  <LeaseRent>{lease.rent}</LeaseRent>
                </LeaseExpiry>
              </LeaseItem>
            ))}
          </LeaseList>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              <IconAlertCircle size={18} />
              Quick Actions
            </SectionTitle>
          </SectionHeader>
          <div style={{ padding: 20, display: 'grid', gap: 12 }}>
            <QuickActionButton>
              <IconHome size={18} />
              Add New Property
            </QuickActionButton>
            <QuickActionButton>
              <IconUsers size={18} />
              Add Tenant
            </QuickActionButton>
            <QuickActionButton>
              <IconTools size={18} />
              Create Work Order
            </QuickActionButton>
            <QuickActionButton>
              <IconPhone size={18} />
              Contact Tenant
            </QuickActionButton>
          </div>
        </Section>
      </ContentGrid>
    </Container>
  );
};

const QuickActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  background: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
    border-color: ${({ theme }) => theme.color.blue};
  }
`;
