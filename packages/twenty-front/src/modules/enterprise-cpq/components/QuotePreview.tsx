import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { QuoteData } from '../types/cpq.types';

const MOCK_QUOTE: QuoteData = {
  id: 'QT-1',
  quoteNumber: 'QT-2026-0042',
  accountName: 'Acme Corp',
  status: 'pending',
  validUntil: '2026-05-30',
  subtotal: 10600,
  tax: 2014,
  grandTotal: 12614,
  createdAt: '2026-04-28',
  lineItems: [
    { id: 'LI-1', productName: 'CRM Enterprise License', sku: 'CRM-ENT-01', quantity: 50, unitPrice: 120, discount: 10, total: 5400 },
    { id: 'LI-2', productName: 'API Add-on', sku: 'API-ADD-01', quantity: 1, unitPrice: 500, discount: 0, total: 500 },
    { id: 'LI-3', productName: 'Premium Support', sku: 'SUP-PRM-01', quantity: 1, unitPrice: 2000, discount: 15, total: 1700 },
    { id: 'LI-4', productName: 'Data Migration', sku: 'SVC-MIG-01', quantity: 1, unitPrice: 3000, discount: 0, total: 3000 },
  ],
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[4]};
  max-width: 800px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledQuoteNumber = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledMeta = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTotalRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledTotalLabel = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledTotalValue = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
  min-width: 100px;
  text-align: right;
`;

export const QuotePreview = () => {
  useLingui();
  const quote = MOCK_QUOTE;

  return (
    <StyledContainer>
      <StyledHeader>
        <div>
          <StyledQuoteNumber>{quote.quoteNumber}</StyledQuoteNumber>
          <StyledMeta>{quote.accountName}</StyledMeta>
        </div>
        <div>
          <StyledMeta>{t`Valid until`}: {quote.validUntil}</StyledMeta>
        </div>
      </StyledHeader>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Product`}</StyledTh>
            <StyledTh>{t`Qty`}</StyledTh>
            <StyledTh>{t`Price`}</StyledTh>
            <StyledTh>{t`Total`}</StyledTh>
          </tr>
        </thead>
        <tbody>
          {quote.lineItems.map((item) => (
            <tr key={item.id}>
              <StyledTd>{item.productName}</StyledTd>
              <StyledTd>{item.quantity}</StyledTd>
              <StyledTd>${item.unitPrice}</StyledTd>
              <StyledTd>${item.total.toLocaleString()}</StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
      <StyledTotalRow>
        <StyledTotalLabel>{t`Subtotal`}</StyledTotalLabel>
        <StyledTotalValue>${quote.subtotal.toLocaleString()}</StyledTotalValue>
      </StyledTotalRow>
      <StyledTotalRow>
        <StyledTotalLabel>{t`Tax`}</StyledTotalLabel>
        <StyledTotalValue>${quote.tax.toLocaleString()}</StyledTotalValue>
      </StyledTotalRow>
      <StyledTotalRow>
        <StyledTotalLabel>{t`Grand Total`}</StyledTotalLabel>
        <StyledTotalValue>${quote.grandTotal.toLocaleString()}</StyledTotalValue>
      </StyledTotalRow>
    </StyledContainer>
  );
};
