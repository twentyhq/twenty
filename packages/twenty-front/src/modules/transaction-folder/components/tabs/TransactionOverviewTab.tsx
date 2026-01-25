import styled from '@emotion/styled';
import { IconCalendar, IconCurrencyDollar, IconHome, IconMapPin, IconUser, IconUsers } from 'twenty-ui/display';

const StyledOverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledSectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledCard = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledCardTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const StyledCardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme }) => theme.color.blue10};
  color: ${({ theme }) => theme.color.blue};
`;

const StyledFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFieldRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledFieldLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledFieldValue = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  overflow: hidden;
`;

const StyledProgressFill = styled.div<{ progress: number }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: ${({ theme, progress }) =>
    progress === 100
      ? theme.color.green
      : progress > 50
        ? theme.color.blue
        : theme.color.orange};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  transition: width 0.3s ease;
`;

const StyledStatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  background: ${({ theme, status }) => {
    switch (status) {
      case 'active':
        return theme.color.blue10;
      case 'pending':
        return theme.color.orange10;
      case 'completed':
        return theme.color.green10;
      case 'cancelled':
        return theme.color.red10;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'active':
        return theme.color.blue;
      case 'pending':
        return theme.color.orange;
      case 'completed':
        return theme.color.green;
      case 'cancelled':
        return theme.color.red;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

type TransactionOverviewTabProps = {
  transactionId: string;
};

export const TransactionOverviewTab = ({
  transactionId,
}: TransactionOverviewTabProps) => {
  // Mock data - would come from GraphQL query
  const transaction = {
    status: 'active',
    transactionType: 'buyer',
    propertyAddress: '123 Main St, Austin, TX 78701',
    contractPrice: 450000,
    contractDate: '2024-01-15',
    closingDate: '2024-02-15',
    earnestMoney: 5000,
    optionFee: 500,
    progress: 65,
    buyer: {
      name: 'John Smith',
      email: 'john@email.com',
      phone: '(512) 555-1234',
    },
    seller: {
      name: 'Jane Doe',
      email: 'jane@email.com',
      phone: '(512) 555-5678',
    },
    agent: {
      name: 'Sarah Johnson',
      role: 'Listing Agent',
    },
    lender: {
      name: 'First National Bank',
      loanOfficer: 'Mike Brown',
    },
  };

  return (
    <StyledOverviewContainer>
      {/* Status & Progress */}
      <StyledSection>
        <StyledSectionTitle>
          <IconHome size={20} />
          Transaction Status
        </StyledSectionTitle>
        <StyledCard>
          <StyledCardHeader>
            <StyledStatusBadge status={transaction.status}>
              {transaction.status.charAt(0).toUpperCase() +
                transaction.status.slice(1)}
            </StyledStatusBadge>
            <StyledFieldValue>
              {transaction.transactionType.charAt(0).toUpperCase() +
                transaction.transactionType.slice(1)}{' '}
              Transaction
            </StyledFieldValue>
          </StyledCardHeader>
          <StyledFieldList>
            <StyledFieldRow>
              <StyledFieldLabel>Overall Progress</StyledFieldLabel>
              <StyledFieldValue>{transaction.progress}%</StyledFieldValue>
            </StyledFieldRow>
            <StyledProgressBar>
              <StyledProgressFill progress={transaction.progress} />
            </StyledProgressBar>
          </StyledFieldList>
        </StyledCard>
      </StyledSection>

      {/* Property Details */}
      <StyledSection>
        <StyledSectionTitle>
          <IconMapPin size={20} />
          Property Details
        </StyledSectionTitle>
        <StyledCard>
          <StyledFieldList>
            <StyledFieldRow>
              <StyledFieldLabel>Property Address</StyledFieldLabel>
              <StyledFieldValue>{transaction.propertyAddress}</StyledFieldValue>
            </StyledFieldRow>
            <StyledFieldRow>
              <StyledFieldLabel>Contract Price</StyledFieldLabel>
              <StyledFieldValue>
                ${transaction.contractPrice.toLocaleString()}
              </StyledFieldValue>
            </StyledFieldRow>
            <StyledFieldRow>
              <StyledFieldLabel>Earnest Money</StyledFieldLabel>
              <StyledFieldValue>
                ${transaction.earnestMoney.toLocaleString()}
              </StyledFieldValue>
            </StyledFieldRow>
            <StyledFieldRow>
              <StyledFieldLabel>Option Fee</StyledFieldLabel>
              <StyledFieldValue>
                ${transaction.optionFee.toLocaleString()}
              </StyledFieldValue>
            </StyledFieldRow>
          </StyledFieldList>
        </StyledCard>
      </StyledSection>

      {/* Key Dates */}
      <StyledSection>
        <StyledSectionTitle>
          <IconCalendar size={20} />
          Key Dates
        </StyledSectionTitle>
        <StyledGrid>
          <StyledCard>
            <StyledCardHeader>
              <StyledCardTitle>Contract Date</StyledCardTitle>
            </StyledCardHeader>
            <StyledFieldValue>
              {new Date(transaction.contractDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </StyledFieldValue>
          </StyledCard>
          <StyledCard>
            <StyledCardHeader>
              <StyledCardTitle>Closing Date</StyledCardTitle>
            </StyledCardHeader>
            <StyledFieldValue>
              {new Date(transaction.closingDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </StyledFieldValue>
          </StyledCard>
        </StyledGrid>
      </StyledSection>

      {/* Parties */}
      <StyledSection>
        <StyledSectionTitle>
          <IconUsers size={20} />
          Transaction Parties
        </StyledSectionTitle>
        <StyledGrid>
          <StyledCard>
            <StyledCardHeader>
              <StyledCardIcon>
                <IconUser size={16} />
              </StyledCardIcon>
              <StyledCardTitle>Buyer</StyledCardTitle>
            </StyledCardHeader>
            <StyledFieldList>
              <StyledFieldRow>
                <StyledFieldLabel>Name</StyledFieldLabel>
                <StyledFieldValue>{transaction.buyer.name}</StyledFieldValue>
              </StyledFieldRow>
              <StyledFieldRow>
                <StyledFieldLabel>Email</StyledFieldLabel>
                <StyledFieldValue>{transaction.buyer.email}</StyledFieldValue>
              </StyledFieldRow>
              <StyledFieldRow>
                <StyledFieldLabel>Phone</StyledFieldLabel>
                <StyledFieldValue>{transaction.buyer.phone}</StyledFieldValue>
              </StyledFieldRow>
            </StyledFieldList>
          </StyledCard>

          <StyledCard>
            <StyledCardHeader>
              <StyledCardIcon>
                <IconUser size={16} />
              </StyledCardIcon>
              <StyledCardTitle>Seller</StyledCardTitle>
            </StyledCardHeader>
            <StyledFieldList>
              <StyledFieldRow>
                <StyledFieldLabel>Name</StyledFieldLabel>
                <StyledFieldValue>{transaction.seller.name}</StyledFieldValue>
              </StyledFieldRow>
              <StyledFieldRow>
                <StyledFieldLabel>Email</StyledFieldLabel>
                <StyledFieldValue>{transaction.seller.email}</StyledFieldValue>
              </StyledFieldRow>
              <StyledFieldRow>
                <StyledFieldLabel>Phone</StyledFieldLabel>
                <StyledFieldValue>{transaction.seller.phone}</StyledFieldValue>
              </StyledFieldRow>
            </StyledFieldList>
          </StyledCard>

          <StyledCard>
            <StyledCardHeader>
              <StyledCardIcon>
                <IconUser size={16} />
              </StyledCardIcon>
              <StyledCardTitle>Agent</StyledCardTitle>
            </StyledCardHeader>
            <StyledFieldList>
              <StyledFieldRow>
                <StyledFieldLabel>Name</StyledFieldLabel>
                <StyledFieldValue>{transaction.agent.name}</StyledFieldValue>
              </StyledFieldRow>
              <StyledFieldRow>
                <StyledFieldLabel>Role</StyledFieldLabel>
                <StyledFieldValue>{transaction.agent.role}</StyledFieldValue>
              </StyledFieldRow>
            </StyledFieldList>
          </StyledCard>

          <StyledCard>
            <StyledCardHeader>
              <StyledCardIcon>
                <IconCurrencyDollar size={16} />
              </StyledCardIcon>
              <StyledCardTitle>Lender</StyledCardTitle>
            </StyledCardHeader>
            <StyledFieldList>
              <StyledFieldRow>
                <StyledFieldLabel>Company</StyledFieldLabel>
                <StyledFieldValue>{transaction.lender.name}</StyledFieldValue>
              </StyledFieldRow>
              <StyledFieldRow>
                <StyledFieldLabel>Loan Officer</StyledFieldLabel>
                <StyledFieldValue>
                  {transaction.lender.loanOfficer}
                </StyledFieldValue>
              </StyledFieldRow>
            </StyledFieldList>
          </StyledCard>
        </StyledGrid>
      </StyledSection>
    </StyledOverviewContainer>
  );
};
