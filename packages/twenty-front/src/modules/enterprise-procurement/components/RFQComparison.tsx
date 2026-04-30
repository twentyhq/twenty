import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { RFQData } from '../types/procurement.types';
import { COMPARE_RFQ_RESPONSES } from '../hooks/useProcurement';

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
  @media (max-width: ${MOBILE_VIEWPORT}px) { grid-template-columns: 1fr; }
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

  const { data, loading, error } = useQuery(COMPARE_RFQ_RESPONSES, {
    variables: { rfqId: 'latest' },
  });

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const rfq: RFQData | undefined = data?.compareRFQResponses;
  const quotes = rfq?.quotes ?? [];
  const lowestPrice = quotes.length > 0 ? Math.min(...quotes.map((q) => q.unitPrice)) : 0;

  return (
    <StyledContainer>
      <StyledTitle>{t`RFQ Comparison`}</StyledTitle>
      {rfq && <StyledSubtitle>{rfq.itemName} - {t`Qty`}: {rfq.quantity}</StyledSubtitle>}
      <StyledGrid>
        {quotes.map((quote) => {
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
                <span>${(quote.unitPrice * (rfq?.quantity ?? 1)).toLocaleString()}</span>
              </StyledRow>
            </StyledCard>
          );
        })}
      </StyledGrid>
    </StyledContainer>
  );
};
