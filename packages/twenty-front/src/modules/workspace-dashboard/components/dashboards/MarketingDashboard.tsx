import styled from '@emotion/styled';
import {
    IconArrowRight,
    IconCalendar,
    IconChartBar,
    IconClick,
    IconDeviceMobile,
    IconEye,
    IconMail,
    IconPlus,
    IconSpeakerphone,
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

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${({ theme }) => theme.color.blue};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.color.blue}dd;
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

const CampaignList = styled.div`
  padding: 0;
`;

const CampaignItem = styled.div`
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

const CampaignIcon = styled.div<{ type: string }>`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: ${({ type }) =>
    type === 'email'
      ? '#3B82F615'
      : type === 'sms'
        ? '#10B98115'
        : type === 'social'
          ? '#EC489915'
          : '#8B5CF615'};
  color: ${({ type }) =>
    type === 'email'
      ? '#3B82F6'
      : type === 'sms'
        ? '#10B981'
        : type === 'social'
          ? '#EC4899'
          : '#8B5CF6'};
`;

const CampaignDetails = styled.div`
  flex: 1;
`;

const CampaignName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 4px;
`;

const CampaignMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CampaignStats = styled.div`
  display: flex;
  gap: 24px;
`;

const CampaignStat = styled.div`
  text-align: center;
`;

const CampaignStatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const CampaignStatLabel = styled.div`
  font-size: 11px;
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
    status === 'active'
      ? '#10B98115'
      : status === 'scheduled'
        ? '#3B82F615'
        : status === 'draft'
          ? '#6B728015'
          : '#8B5CF615'};
  color: ${({ status }) =>
    status === 'active'
      ? '#10B981'
      : status === 'scheduled'
        ? '#3B82F6'
        : status === 'draft'
          ? '#6B7280'
          : '#8B5CF6'};
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 20px;
`;

const TemplateCard = styled.div`
  padding: 16px;
  background: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const TemplateIcon = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color }) => `${color}15`};
  border-radius: 8px;
  color: ${({ color }) => color};
  margin-bottom: 12px;
`;

const TemplateName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: 4px;
`;

const TemplateCount = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const ScheduleList = styled.div`
  padding: 0;
`;

const ScheduleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const ScheduleDate = styled.div`
  width: 44px;
  height: 44px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ScheduleMonth = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  font-weight: 600;
`;

const ScheduleDay = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ScheduleDetails = styled.div`
  flex: 1;
`;

const ScheduleTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const ScheduleTime = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const ScheduleType = styled.div<{ type: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ type }) =>
    type === 'email' ? '#3B82F615' : type === 'sms' ? '#10B98115' : '#EC489915'};
  color: ${({ type }) => (type === 'email' ? '#3B82F6' : type === 'sms' ? '#10B981' : '#EC4899')};
`;

const PerformanceCard = styled.div`
  padding: 20px;
`;

const PerformanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const PerformanceLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const PerformanceValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

// Mock data
const stats = [
  { label: 'Active Campaigns', value: 8, change: '+2 this week', positive: true, color: '#EC4899', icon: IconSpeakerphone },
  { label: 'Emails Sent', value: '12.4K', change: 'This month', positive: true, color: '#3B82F6', icon: IconMail },
  { label: 'Open Rate', value: '34.2%', change: '+5.1% vs avg', positive: true, color: '#10B981', icon: IconEye },
  { label: 'Click Rate', value: '8.7%', change: '+2.3% vs avg', positive: true, color: '#F59E0B', icon: IconClick },
];

const campaigns = [
  { id: 1, name: 'January Newsletter', type: 'email', status: 'active', sent: 2450, opened: 892, clicked: 234, date: 'Jan 15' },
  { id: 2, name: 'Open House Reminder', type: 'sms', status: 'active', sent: 156, opened: 142, clicked: 89, date: 'Jan 20' },
  { id: 3, name: 'New Listing Alert', type: 'email', status: 'scheduled', sent: 0, opened: 0, clicked: 0, date: 'Jan 28' },
  { id: 4, name: 'Valentine\'s Day Promo', type: 'social', status: 'draft', sent: 0, opened: 0, clicked: 0, date: 'Feb 14' },
];

const templates = [
  { name: 'Email Templates', count: 24, icon: IconMail, color: '#3B82F6' },
  { name: 'SMS Templates', count: 12, icon: IconDeviceMobile, color: '#10B981' },
  { name: 'Social Posts', count: 36, icon: IconSpeakerphone, color: '#EC4899' },
  { name: 'Newsletters', count: 8, icon: IconChartBar, color: '#8B5CF6' },
];

const scheduled = [
  { date: 28, month: 'Jan', title: 'New Listing Alert', time: '9:00 AM', type: 'email' },
  { date: 30, month: 'Jan', title: 'Market Update SMS', time: '2:00 PM', type: 'sms' },
  { date: 1, month: 'Feb', title: 'Monthly Newsletter', time: '10:00 AM', type: 'email' },
];

const performance = [
  { label: 'Total Subscribers', value: '4,892', icon: IconUsers },
  { label: 'Avg. Engagement', value: '42.3%', icon: IconChartBar },
  { label: 'List Growth', value: '+124', icon: IconTrendingUp },
];

export const MarketingDashboard = () => {
  return (
    <Container>
      <Header>
        <HeaderLeft>
          <WelcomeText>Marketing Dashboard</WelcomeText>
          <SubText>Manage campaigns, templates, and track engagement</SubText>
        </HeaderLeft>
        <CreateButton>
          <IconPlus size={18} />
          New Campaign
        </CreateButton>
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
                <IconSpeakerphone size={18} />
                Recent Campaigns
              </SectionTitle>
              <ViewAllButton>
                View All <IconArrowRight size={14} />
              </ViewAllButton>
            </SectionHeader>
            <CampaignList>
              {campaigns.map((campaign) => (
                <CampaignItem key={campaign.id}>
                  <CampaignIcon type={campaign.type}>
                    {campaign.type === 'email' ? (
                      <IconMail size={20} />
                    ) : campaign.type === 'sms' ? (
                      <IconDeviceMobile size={20} />
                    ) : (
                      <IconSpeakerphone size={20} />
                    )}
                  </CampaignIcon>
                  <CampaignDetails>
                    <CampaignName>{campaign.name}</CampaignName>
                    <CampaignMeta>
                      <span>{campaign.type.toUpperCase()}</span>
                      <span>•</span>
                      <span>{campaign.date}</span>
                    </CampaignMeta>
                  </CampaignDetails>
                  <CampaignStats>
                    <CampaignStat>
                      <CampaignStatValue>{campaign.sent.toLocaleString()}</CampaignStatValue>
                      <CampaignStatLabel>Sent</CampaignStatLabel>
                    </CampaignStat>
                    <CampaignStat>
                      <CampaignStatValue>{campaign.opened.toLocaleString()}</CampaignStatValue>
                      <CampaignStatLabel>Opened</CampaignStatLabel>
                    </CampaignStat>
                    <CampaignStat>
                      <CampaignStatValue>{campaign.clicked}</CampaignStatValue>
                      <CampaignStatLabel>Clicked</CampaignStatLabel>
                    </CampaignStat>
                  </CampaignStats>
                  <StatusBadge status={campaign.status}>
                    {campaign.status === 'active'
                      ? 'Active'
                      : campaign.status === 'scheduled'
                        ? 'Scheduled'
                        : campaign.status === 'draft'
                          ? 'Draft'
                          : 'Completed'}
                  </StatusBadge>
                </CampaignItem>
              ))}
            </CampaignList>
          </Section>
        </div>

        <RightColumn>
          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconMail size={18} />
                Templates
              </SectionTitle>
            </SectionHeader>
            <TemplateGrid>
              {templates.map((template, index) => (
                <TemplateCard key={index}>
                  <TemplateIcon color={template.color}>
                    <template.icon size={18} />
                  </TemplateIcon>
                  <TemplateName>{template.name}</TemplateName>
                  <TemplateCount>{template.count} templates</TemplateCount>
                </TemplateCard>
              ))}
            </TemplateGrid>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconCalendar size={18} />
                Scheduled
              </SectionTitle>
            </SectionHeader>
            <ScheduleList>
              {scheduled.map((item, index) => (
                <ScheduleItem key={index}>
                  <ScheduleDate>
                    <ScheduleMonth>{item.month}</ScheduleMonth>
                    <ScheduleDay>{item.date}</ScheduleDay>
                  </ScheduleDate>
                  <ScheduleDetails>
                    <ScheduleTitle>{item.title}</ScheduleTitle>
                    <ScheduleTime>{item.time}</ScheduleTime>
                  </ScheduleDetails>
                  <ScheduleType type={item.type}>{item.type.toUpperCase()}</ScheduleType>
                </ScheduleItem>
              ))}
            </ScheduleList>
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle>
                <IconChartBar size={18} />
                Performance
              </SectionTitle>
            </SectionHeader>
            <PerformanceCard>
              {performance.map((item, index) => (
                <PerformanceRow key={index}>
                  <PerformanceLabel>
                    <item.icon size={16} />
                    {item.label}
                  </PerformanceLabel>
                  <PerformanceValue>{item.value}</PerformanceValue>
                </PerformanceRow>
              ))}
            </PerformanceCard>
          </Section>
        </RightColumn>
      </ContentGrid>
    </Container>
  );
};
