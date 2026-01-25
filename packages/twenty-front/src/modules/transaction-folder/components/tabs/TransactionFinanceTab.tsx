import styled from '@emotion/styled';
import {
    IconCurrencyDollar
} from 'twenty-ui/display';

const StyledFinanceContainer = styled.div`
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

const StyledSummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledSummaryCard = styled.div<{ variant?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme, variant }) => {
    switch (variant) {
      case 'success':
        return theme.color.green10;
      case 'primary':
        return theme.color.blue10;
      default:
        return theme.background.secondary;
    }
  }};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledCardLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledCardValue = styled.span<{ variant?: string }>`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'success':
        return theme.color.green;
      case 'primary':
        return theme.color.blue;
      default:
        return theme.font.color.primary;
    }
  }};
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

const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
`;

const StyledTableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledTableRow = styled.div<{ isTotal?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  background: ${({ theme, isTotal }) =>
    isTotal ? theme.background.secondary : theme.background.primary};
  font-weight: ${({ isTotal }) => (isTotal ? '600' : '400')};
`;

const StyledTableCell = styled.span<{ align?: string; type?: string }>`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme, type }) => {
    switch (type) {
      case 'income':
        return theme.color.green;
      case 'expense':
        return theme.color.red;
      default:
        return theme.font.color.primary;
    }
  }};
  text-align: ${({ align }) => align || 'left'};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(6)};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCommissionBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledCommissionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledCommissionLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledCommissionValue = styled.span<{ isTotal?: boolean }>`
  font-size: ${({ theme, isTotal }) =>
    isTotal ? theme.font.size.lg : theme.font.size.sm};
  font-weight: ${({ isTotal }) => (isTotal ? '600' : '400')};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border.color.light};
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

type TransactionFinanceTabProps = {
  transactionId: string;
};

export const TransactionFinanceTab = ({
  transactionId,
}: TransactionFinanceTabProps) => {
  // Mock data - would come from Transaction entity
  const finance = {
    contractPrice: 450000,
    earnestMoney: 5000,
    optionFee: 500,
    commissionRate: 3.0,
    buyerAgentSplit: 50,
    sellerAgentSplit: 50,
    closingCosts: {
      buyer: 12500,
      seller: 8200,
    },
    loanAmount: 360000,
    downPayment: 90000,
  };

  const grossCommission = finance.contractPrice * (finance.commissionRate / 100);
  const buyerAgentCommission = grossCommission * (finance.buyerAgentSplit / 100);
  const sellerAgentCommission = grossCommission * (finance.sellerAgentSplit / 100);

  const buyerClosingItems = [
    { description: 'Loan Origination Fee', amount: 3600, type: 'expense' },
    { description: 'Appraisal Fee', amount: 550, type: 'expense' },
    { description: 'Title Insurance', amount: 2800, type: 'expense' },
    { description: 'Escrow/Title Fees', amount: 1200, type: 'expense' },
    { description: 'Recording Fees', amount: 150, type: 'expense' },
    { description: 'Home Inspection', amount: 450, type: 'expense' },
    { description: 'Survey', amount: 500, type: 'expense' },
    { description: 'Prepaid Interest', amount: 1250, type: 'expense' },
    { description: 'Property Taxes (Prorated)', amount: 1500, type: 'expense' },
    { description: 'Homeowners Insurance', amount: 500, type: 'expense' },
  ];

  const sellerClosingItems = [
    { description: "Owner's Title Policy", amount: 2800, type: 'expense' },
    { description: 'Real Estate Commission', amount: grossCommission, type: 'expense' },
    { description: 'Property Taxes (Prorated)', amount: 800, type: 'expense' },
    { description: 'HOA Transfer Fee', amount: 250, type: 'expense' },
    { description: 'Home Warranty', amount: 550, type: 'expense' },
    { description: 'Repair Credits', amount: 1500, type: 'expense' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <StyledFinanceContainer>
      <StyledHeader>
        <StyledTitle>
          <IconCurrencyDollar size={20} />
          Financial Overview
        </StyledTitle>
      </StyledHeader>

      <StyledSummaryCards>
        <StyledSummaryCard variant="primary">
          <StyledCardLabel>Contract Price</StyledCardLabel>
          <StyledCardValue variant="primary">
            {formatCurrency(finance.contractPrice)}
          </StyledCardValue>
        </StyledSummaryCard>
        <StyledSummaryCard>
          <StyledCardLabel>Loan Amount</StyledCardLabel>
          <StyledCardValue>{formatCurrency(finance.loanAmount)}</StyledCardValue>
        </StyledSummaryCard>
        <StyledSummaryCard>
          <StyledCardLabel>Down Payment</StyledCardLabel>
          <StyledCardValue>{formatCurrency(finance.downPayment)}</StyledCardValue>
        </StyledSummaryCard>
        <StyledSummaryCard variant="success">
          <StyledCardLabel>Gross Commission</StyledCardLabel>
          <StyledCardValue variant="success">
            {formatCurrency(grossCommission)}
          </StyledCardValue>
        </StyledSummaryCard>
      </StyledSummaryCards>

      <StyledGrid>
        {/* Commission Breakdown */}
        <StyledSection>
          <StyledSectionTitle>Commission Breakdown</StyledSectionTitle>
          <StyledCommissionBreakdown>
            <StyledCommissionRow>
              <StyledCommissionLabel>Contract Price</StyledCommissionLabel>
              <StyledCommissionValue>
                {formatCurrency(finance.contractPrice)}
              </StyledCommissionValue>
            </StyledCommissionRow>
            <StyledCommissionRow>
              <StyledCommissionLabel>Commission Rate</StyledCommissionLabel>
              <StyledCommissionValue>
                {finance.commissionRate}%
              </StyledCommissionValue>
            </StyledCommissionRow>
            <StyledDivider />
            <StyledCommissionRow>
              <StyledCommissionLabel>Gross Commission</StyledCommissionLabel>
              <StyledCommissionValue>
                {formatCurrency(grossCommission)}
              </StyledCommissionValue>
            </StyledCommissionRow>
            <StyledDivider />
            <StyledCommissionRow>
              <StyledCommissionLabel>
                Buyer Agent ({finance.buyerAgentSplit}%)
              </StyledCommissionLabel>
              <StyledCommissionValue>
                {formatCurrency(buyerAgentCommission)}
              </StyledCommissionValue>
            </StyledCommissionRow>
            <StyledCommissionRow>
              <StyledCommissionLabel>
                Seller Agent ({finance.sellerAgentSplit}%)
              </StyledCommissionLabel>
              <StyledCommissionValue>
                {formatCurrency(sellerAgentCommission)}
              </StyledCommissionValue>
            </StyledCommissionRow>
          </StyledCommissionBreakdown>
        </StyledSection>

        {/* Deposits */}
        <StyledSection>
          <StyledSectionTitle>Deposits & Option</StyledSectionTitle>
          <StyledCommissionBreakdown>
            <StyledCommissionRow>
              <StyledCommissionLabel>Earnest Money</StyledCommissionLabel>
              <StyledCommissionValue>
                {formatCurrency(finance.earnestMoney)}
              </StyledCommissionValue>
            </StyledCommissionRow>
            <StyledCommissionRow>
              <StyledCommissionLabel>Option Fee</StyledCommissionLabel>
              <StyledCommissionValue>
                {formatCurrency(finance.optionFee)}
              </StyledCommissionValue>
            </StyledCommissionRow>
            <StyledDivider />
            <StyledCommissionRow>
              <StyledCommissionLabel>Total Deposits</StyledCommissionLabel>
              <StyledCommissionValue isTotal>
                {formatCurrency(finance.earnestMoney + finance.optionFee)}
              </StyledCommissionValue>
            </StyledCommissionRow>
          </StyledCommissionBreakdown>
        </StyledSection>
      </StyledGrid>

      {/* Buyer Closing Costs */}
      <StyledSection>
        <StyledSectionTitle>Estimated Buyer Closing Costs</StyledSectionTitle>
        <StyledTable>
          <StyledTableHeader>
            <span>Description</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
            <span style={{ textAlign: 'right' }}>Status</span>
          </StyledTableHeader>
          {buyerClosingItems.map((item, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{item.description}</StyledTableCell>
              <StyledTableCell align="right" type={item.type}>
                {formatCurrency(item.amount)}
              </StyledTableCell>
              <StyledTableCell align="right">Estimated</StyledTableCell>
            </StyledTableRow>
          ))}
          <StyledTableRow isTotal>
            <StyledTableCell>Total Buyer Closing Costs</StyledTableCell>
            <StyledTableCell align="right">
              {formatCurrency(
                buyerClosingItems.reduce((sum, item) => sum + item.amount, 0),
              )}
            </StyledTableCell>
            <StyledTableCell align="right"></StyledTableCell>
          </StyledTableRow>
        </StyledTable>
      </StyledSection>

      {/* Seller Closing Costs */}
      <StyledSection>
        <StyledSectionTitle>Estimated Seller Closing Costs</StyledSectionTitle>
        <StyledTable>
          <StyledTableHeader>
            <span>Description</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
            <span style={{ textAlign: 'right' }}>Status</span>
          </StyledTableHeader>
          {sellerClosingItems.map((item, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell>{item.description}</StyledTableCell>
              <StyledTableCell align="right" type={item.type}>
                {formatCurrency(item.amount)}
              </StyledTableCell>
              <StyledTableCell align="right">Estimated</StyledTableCell>
            </StyledTableRow>
          ))}
          <StyledTableRow isTotal>
            <StyledTableCell>Total Seller Closing Costs</StyledTableCell>
            <StyledTableCell align="right">
              {formatCurrency(
                sellerClosingItems.reduce((sum, item) => sum + item.amount, 0),
              )}
            </StyledTableCell>
            <StyledTableCell align="right"></StyledTableCell>
          </StyledTableRow>
        </StyledTable>
      </StyledSection>
    </StyledFinanceContainer>
  );
};
