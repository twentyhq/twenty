import styled from '@emotion/styled';
import {
    IconAlertTriangle,
    IconCalendar,
    IconCheck,
    IconClock,
    IconFile,
    IconShield,
} from 'twenty-ui/display';

const StyledComplianceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledScoreCard = styled.div<{ score: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  background: ${({ theme, score }) => {
    if (score >= 90) return theme.color.green10;
    if (score >= 70) return theme.color.orange10;
    return theme.color.red10;
  }};
`;

const StyledScoreNumber = styled.span<{ score: number }>`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme, score }) => {
    if (score >= 90) return theme.color.green;
    if (score >= 70) return theme.color.orange;
    return theme.color.red;
  }};
`;

const StyledScoreLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledStatCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledStatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledStatIcon = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme, status }) => {
    switch (status) {
      case 'good':
        return theme.color.green10;
      case 'warning':
        return theme.color.orange10;
      case 'danger':
        return theme.color.red10;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'good':
        return theme.color.green;
      case 'warning':
        return theme.color.orange;
      case 'danger':
        return theme.color.red;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

const StyledStatLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledStatValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const StyledComplianceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledComplianceItem = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-left: 4px solid
    ${({ theme, status }) => {
      switch (status) {
        case 'complete':
          return theme.color.green;
        case 'pending':
          return theme.color.orange;
        case 'overdue':
          return theme.color.red;
        default:
          return theme.border.color.medium;
      }
    }};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledItemIcon = styled.div<{ status: string }>`
  color: ${({ theme, status }) => {
    switch (status) {
      case 'complete':
        return theme.color.green;
      case 'pending':
        return theme.color.orange;
      case 'overdue':
        return theme.color.red;
      default:
        return theme.font.color.tertiary;
    }
  }};
`;

const StyledItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledItemTitle = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledItemMeta = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledStatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  background: ${({ theme, status }) => {
    switch (status) {
      case 'complete':
        return theme.color.green10;
      case 'pending':
        return theme.color.orange10;
      case 'overdue':
        return theme.color.red10;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'complete':
        return theme.color.green;
      case 'pending':
        return theme.color.orange;
      case 'overdue':
        return theme.color.red;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

const StyledRiskBadge = styled.span<{ level: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  background: ${({ theme, level }) => {
    switch (level) {
      case 'low':
        return theme.color.green10;
      case 'medium':
        return theme.color.orange10;
      case 'high':
        return theme.color.red10;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, level }) => {
    switch (level) {
      case 'low':
        return theme.color.green;
      case 'medium':
        return theme.color.orange;
      case 'high':
        return theme.color.red;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

type TransactionComplianceTabProps = {
  transactionId: string;
};

export const TransactionComplianceTab = ({
  transactionId,
}: TransactionComplianceTabProps) => {
  // Mock data - would come from Compliance entity
  const complianceScore = 85;

  const stats = [
    {
      label: 'Required Documents',
      value: '12/14',
      status: 'warning',
      icon: IconFile,
    },
    {
      label: 'Deadlines Met',
      value: '8/8',
      status: 'good',
      icon: IconCalendar,
    },
    {
      label: 'Pending Signatures',
      value: '2',
      status: 'warning',
      icon: IconClock,
    },
    {
      label: 'Compliance Issues',
      value: '1',
      status: 'danger',
      icon: IconAlertTriangle,
    },
  ];

  const complianceItems = [
    {
      id: '1',
      title: "Seller's Disclosure Notice",
      requirement: 'Required by Texas Property Code §5.008',
      status: 'complete',
      completedDate: '2024-01-14',
      riskLevel: 'low',
    },
    {
      id: '2',
      title: 'Lead-Based Paint Disclosure',
      requirement: 'Required for homes built before 1978',
      status: 'complete',
      completedDate: '2024-01-14',
      riskLevel: 'low',
    },
    {
      id: '3',
      title: 'TREC Information About Brokerage Services',
      requirement: 'Required disclosure to all parties',
      status: 'complete',
      completedDate: '2024-01-10',
      riskLevel: 'low',
    },
    {
      id: '4',
      title: 'Earnest Money Receipt',
      requirement: 'Must be deposited within 3 days',
      status: 'complete',
      completedDate: '2024-01-17',
      riskLevel: 'low',
    },
    {
      id: '5',
      title: 'Option Fee Documentation',
      requirement: 'Must be delivered within deadline',
      status: 'complete',
      completedDate: '2024-01-16',
      riskLevel: 'low',
    },
    {
      id: '6',
      title: 'HOA Documents',
      requirement: 'Required if property is in HOA',
      status: 'pending',
      dueDate: '2024-01-28',
      riskLevel: 'medium',
    },
    {
      id: '7',
      title: 'Survey Delivery',
      requirement: 'Per contract requirements',
      status: 'pending',
      dueDate: '2024-02-01',
      riskLevel: 'medium',
    },
    {
      id: '8',
      title: 'Title Commitment Objection Period',
      requirement: 'Must object within 5 days of receipt',
      status: 'overdue',
      dueDate: '2024-01-25',
      riskLevel: 'high',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <IconCheck size={18} />;
      case 'pending':
        return <IconClock size={18} />;
      case 'overdue':
        return <IconAlertTriangle size={18} />;
      default:
        return <IconShield size={18} />;
    }
  };

  return (
    <StyledComplianceContainer>
      <StyledHeader>
        <StyledTitle>
          <IconShield size={20} />
          Compliance Overview
        </StyledTitle>
        <StyledScoreCard score={complianceScore}>
          <StyledScoreNumber score={complianceScore}>
            {complianceScore}%
          </StyledScoreNumber>
          <StyledScoreLabel>Compliance Score</StyledScoreLabel>
        </StyledScoreCard>
      </StyledHeader>

      <StyledGrid>
        {stats.map((stat, index) => (
          <StyledStatCard key={index}>
            <StyledStatHeader>
              <StyledStatIcon status={stat.status}>
                <stat.icon size={20} />
              </StyledStatIcon>
              <StyledStatLabel>{stat.label}</StyledStatLabel>
            </StyledStatHeader>
            <StyledStatValue>{stat.value}</StyledStatValue>
          </StyledStatCard>
        ))}
      </StyledGrid>

      <StyledSection>
        <StyledSectionTitle>Compliance Requirements</StyledSectionTitle>
        <StyledComplianceList>
          {complianceItems.map((item) => (
            <StyledComplianceItem key={item.id} status={item.status}>
              <StyledItemLeft>
                <StyledItemIcon status={item.status}>
                  {getStatusIcon(item.status)}
                </StyledItemIcon>
                <StyledItemContent>
                  <StyledItemTitle>{item.title}</StyledItemTitle>
                  <StyledItemMeta>{item.requirement}</StyledItemMeta>
                </StyledItemContent>
              </StyledItemLeft>
              <StyledItemRight>
                <StyledRiskBadge level={item.riskLevel}>
                  {item.riskLevel.charAt(0).toUpperCase() +
                    item.riskLevel.slice(1)}{' '}
                  Risk
                </StyledRiskBadge>
                <StyledStatusBadge status={item.status}>
                  {item.status === 'complete'
                    ? `Completed ${new Date(item.completedDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : item.status === 'pending'
                      ? `Due ${new Date(item.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : `Overdue ${new Date(item.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </StyledStatusBadge>
              </StyledItemRight>
            </StyledComplianceItem>
          ))}
        </StyledComplianceList>
      </StyledSection>
    </StyledComplianceContainer>
  );
};
