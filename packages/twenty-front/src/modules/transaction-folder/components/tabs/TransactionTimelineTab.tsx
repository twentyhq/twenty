import styled from '@emotion/styled';
import {
    IconAlertTriangle,
    IconCalendar,
    IconCheck,
    IconClock,
} from 'twenty-ui/display';

const StyledTimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
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
`;

const StyledLegend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledLegendDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const StyledTimeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
`;

const StyledTimelineItem = styled.div<{ status: string }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  position: relative;
  padding: ${({ theme }) => theme.spacing(4)} 0;

  &::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.border.color.light};
  }

  &:first-of-type::before {
    top: 50%;
  }

  &:last-of-type::before {
    bottom: 50%;
  }
`;

const StyledTimelineIcon = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  z-index: 1;
  flex-shrink: 0;
  background: ${({ theme, status }) => {
    switch (status) {
      case 'completed':
        return theme.color.green;
      case 'current':
        return theme.color.blue;
      case 'overdue':
        return theme.color.red;
      case 'upcoming':
        return theme.background.tertiary;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'completed':
      case 'current':
      case 'overdue':
        return 'white';
      default:
        return theme.font.color.tertiary;
    }
  }};
  border: 2px solid
    ${({ theme, status }) => {
      switch (status) {
        case 'completed':
          return theme.color.green;
        case 'current':
          return theme.color.blue;
        case 'overdue':
          return theme.color.red;
        case 'upcoming':
          return theme.border.color.medium;
        default:
          return theme.border.color.light;
      }
    }};
`;

const StyledTimelineContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const StyledTimelineTitle = styled.span<{ status: string }>`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme, status }) =>
    status === 'completed'
      ? theme.font.color.tertiary
      : theme.font.color.primary};
  text-decoration: ${({ status }) =>
    status === 'completed' ? 'line-through' : 'none'};
`;

const StyledTimelineDate = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'overdue':
        return theme.color.red;
      case 'current':
        return theme.color.blue;
      default:
        return theme.font.color.secondary;
    }
  }};
  font-weight: ${({ status }) =>
    status === 'overdue' || status === 'current' ? '500' : '400'};
`;

const StyledTimelineDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  margin: 0;
`;

const StyledDaysRemaining = styled.span<{ isUrgent: boolean }>`
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  background: ${({ theme, isUrgent }) =>
    isUrgent ? theme.color.red10 : theme.color.blue10};
  color: ${({ theme, isUrgent }) =>
    isUrgent ? theme.color.red : theme.color.blue};
`;

type TransactionTimelineTabProps = {
  transactionId: string;
};

export const TransactionTimelineTab = ({
  transactionId,
}: TransactionTimelineTabProps) => {
  // Mock data - would come from TimelineDate entity
  const timelineItems = [
    {
      id: '1',
      title: 'Contract Executed',
      date: '2024-01-15',
      status: 'completed',
      description: 'All parties signed the purchase agreement',
      daysFromContract: 0,
    },
    {
      id: '2',
      title: 'Earnest Money Due',
      date: '2024-01-18',
      status: 'completed',
      description: '$5,000 deposited with title company',
      daysFromContract: 3,
    },
    {
      id: '3',
      title: 'Option Period Ends',
      date: '2024-01-22',
      status: 'completed',
      description: '7-day unrestricted right to terminate',
      daysFromContract: 7,
    },
    {
      id: '4',
      title: 'Home Inspection',
      date: '2024-01-20',
      status: 'completed',
      description: 'Full property inspection completed',
      daysFromContract: 5,
    },
    {
      id: '5',
      title: 'Appraisal Ordered',
      date: '2024-01-20',
      status: 'completed',
      description: 'Lender ordered property appraisal',
      daysFromContract: 5,
    },
    {
      id: '6',
      title: 'Appraisal Complete',
      date: '2024-01-29',
      status: 'current',
      description: 'Awaiting appraisal report',
      daysFromContract: 14,
    },
    {
      id: '7',
      title: 'Title Commitment',
      date: '2024-01-25',
      status: 'overdue',
      description: 'Title company to provide commitment',
      daysFromContract: 10,
    },
    {
      id: '8',
      title: 'Loan Approval',
      date: '2024-02-05',
      status: 'upcoming',
      description: 'Full underwriting approval',
      daysFromContract: 21,
    },
    {
      id: '9',
      title: 'Clear to Close',
      date: '2024-02-10',
      status: 'upcoming',
      description: 'All conditions satisfied',
      daysFromContract: 26,
    },
    {
      id: '10',
      title: 'Final Walkthrough',
      date: '2024-02-14',
      status: 'upcoming',
      description: 'Buyer inspection before closing',
      daysFromContract: 30,
    },
    {
      id: '11',
      title: 'Closing Day',
      date: '2024-02-15',
      status: 'upcoming',
      description: 'Sign closing documents, transfer funds',
      daysFromContract: 31,
    },
    {
      id: '12',
      title: 'Recording Complete',
      date: '2024-02-16',
      status: 'upcoming',
      description: 'Deed recorded at county',
      daysFromContract: 32,
    },
  ];

  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <IconCheck size={18} />;
      case 'current':
        return <IconClock size={18} />;
      case 'overdue':
        return <IconAlertTriangle size={18} />;
      default:
        return <IconCalendar size={18} />;
    }
  };

  const getDaysRemaining = (dateStr: string, status: string) => {
    if (status === 'completed') return null;

    const today = new Date();
    const date = new Date(dateStr);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <StyledDaysRemaining isUrgent={true}>
          {Math.abs(diffDays)} days overdue
        </StyledDaysRemaining>
      );
    } else if (diffDays === 0) {
      return (
        <StyledDaysRemaining isUrgent={true}>Today</StyledDaysRemaining>
      );
    } else if (diffDays <= 3) {
      return (
        <StyledDaysRemaining isUrgent={true}>
          {diffDays} days left
        </StyledDaysRemaining>
      );
    } else {
      return (
        <StyledDaysRemaining isUrgent={false}>
          {diffDays} days
        </StyledDaysRemaining>
      );
    }
  };

  return (
    <StyledTimelineContainer>
      <StyledHeader>
        <StyledTitle>Transaction Timeline</StyledTitle>
        <StyledLegend>
          <StyledLegendItem>
            <StyledLegendDot color="#00a876" />
            Completed
          </StyledLegendItem>
          <StyledLegendItem>
            <StyledLegendDot color="#1961ed" />
            In Progress
          </StyledLegendItem>
          <StyledLegendItem>
            <StyledLegendDot color="#f04438" />
            Overdue
          </StyledLegendItem>
          <StyledLegendItem>
            <StyledLegendDot color="#98a2b3" />
            Upcoming
          </StyledLegendItem>
        </StyledLegend>
      </StyledHeader>

      <StyledTimeline>
        {timelineItems.map((item) => (
          <StyledTimelineItem key={item.id} status={item.status}>
            <StyledTimelineIcon status={item.status}>
              {getIcon(item.status)}
            </StyledTimelineIcon>
            <StyledTimelineContent>
              <StyledTimelineHeader>
                <StyledTimelineTitle status={item.status}>
                  {item.title}
                </StyledTimelineTitle>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <StyledTimelineDate status={item.status}>
                    <IconCalendar size={14} />
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </StyledTimelineDate>
                  {getDaysRemaining(item.date, item.status)}
                </div>
              </StyledTimelineHeader>
              <StyledTimelineDescription>
                {item.description} • Day {item.daysFromContract}
              </StyledTimelineDescription>
            </StyledTimelineContent>
          </StyledTimelineItem>
        ))}
      </StyledTimeline>
    </StyledTimelineContainer>
  );
};
