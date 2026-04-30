import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { RFQData } from '../types/procurement.types';

const MOCK_RFQ: RFQData = {
  id: 'RFQ-501',
  itemName: 'ThinkPad X1 Carbon Gen 12',
  quantity: 50,
  quotes: [
    { supplierId: 'S1', supplierName: 'TechDistributor CO', unitPrice: 4200000, leadTimeDays: 14, warranty: '3 years', rating: 4.5, currency: 'COP' },
    { supplierId: 'S2', supplierName: 'CompuMall SAS', unitPrice: 4050000, leadTimeDays: 21, warranty: '2 years', rating: 3.8, currency: 'COP' },
    { supplierId: 'S3', supplierName: 'GlobalIT Express', unitPrice: 4350000, leadTimeDays: 7, warranty: '3 years', rating: 4.9, currency: 'COP' },
  ],
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledSubtitle = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div<{ isBest: boolean }>`
  padding: ${themeCssVariables.spacing[3]};
  border: 2px solid ${({ isBest }) =>
    isBest ? themeCssVariables.color.turquoise : themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSupplier = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledPrice = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledBestBadge = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  padding: 2px 6px;
  border-radius: 4px;
  background: ${themeCssVariables.color.turquoise};
  color: ${themeCssVariables.font.color.inverted};
  align-self: flex-start;
`;

export const RFQComparison = () => {
  useLingui();

  const lowestPrice = Math.min(...MOCK_RFQ.quotes.map((q) => q.unitPrice));

  return (
    <StyledContainer>
      <StyledTitle>{t`RFQ Comparison`}</StyledTitle>
      <StyledSubtitle>{MOCK_RFQ.itemName} - {t`Qty`}: {MOCK_RFQ.quantity}</StyledSubtitle>
      <StyledGrid>
        {MOCK_RFQ.quotes.map((quote) => {
          const isBest = quote.unitPrice === lowestPrice;
          return (
            <StyledCard key={quote.supplierId} isBest={isBest}>
              {isBest && <StyledBestBadge>{t`Best Price`}</StyledBestBadge>}
              <StyledSupplier>{quote.supplierName}</StyledSupplier>
              <StyledPrice>${quote.unitPrice.toLocaleString()}/unit</StyledPrice>
              <StyledRow>
                <span>{t`Lead Time`}</span>
                <span>{quote.leadTimeDays} {t`days`}</span>
              </StyledRow>
              <StyledRow>
                <span>{t`Warranty`}</span>
                <span>{quote.warranty}</span>
              </StyledRow>
              <StyledRow>
                <span>{t`Rating`}</span>
                <span>{quote.rating}/5</span>
              </StyledRow>
              <StyledRow>
                <span>{t`Total`}</span>
                <span>${(quote.unitPrice * MOCK_RFQ.quantity).toLocaleString()}</span>
              </StyledRow>
            </StyledCard>
          );
        })}
      </StyledGrid>
    </StyledContainer>
  );
};
