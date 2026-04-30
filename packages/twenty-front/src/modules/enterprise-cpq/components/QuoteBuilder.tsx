import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { QuoteLineItem } from '../types/cpq.types';
import { GET_CPQ_DATA } from '../hooks/useCPQ';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledTotalRow = styled.div` display: flex; justify-content: flex-end; gap: ${themeCssVariables.spacing[4]}; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; `;
const StyledTotalLabel = styled.span` color: ${themeCssVariables.font.color.tertiary}; `;
const StyledTotalValue = styled.span` font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const QuoteBuilder = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_CPQ_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const lineItems: QuoteLineItem[] = data?.cpqData?.lineItems ?? [];
  const subtotal = lineItems.reduce((sum, item) => sum + (item.total ?? 0), 0);
  const tax = Math.round(subtotal * 0.19);
  const grandTotal = subtotal + tax;
  return (
    <StyledContainer>
      <StyledTitle>{t`Quote Builder`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Product`}</StyledTh><StyledTh>{t`Qty`}</StyledTh><StyledTh>{t`Unit Price`}</StyledTh><StyledRHH>{t`Discount`}</StyledRHH><StyledTh>{t`Total`}</StyledTh></tr></thead>
        <tbody>{lineItems.map((item) => (<tr key={item.id}><StyledTd>{item.productName}</StyledTd><StyledTd>{item.quantity}</StyledTd><StyledTd>${item.unitPrice}</StyledTd><StyledRH>{item.discount}%</StyledRH><StyledTd>${item.total.toLocaleString()}</StyledTd></tr>))}</tbody>
      </StyledTable>
      <StyledTotalRow><StyledTotalLabel>{t`Subtotal`}</StyledTotalLabel><StyledTotalValue>${subtotal.toLocaleString()}</StyledTotalValue></StyledTotalRow>
      <StyledTotalRow><StyledTotalLabel>{t`Tax (19%)`}</StyledTotalLabel><StyledTotalValue>${tax.toLocaleString()}</StyledTotalValue></StyledTotalRow>
      <StyledTotalRow><StyledTotalLabel>{t`Grand Total`}</StyledTotalLabel><StyledTotalValue>${grandTotal.toLocaleString()}</StyledTotalValue></StyledTotalRow>
    </StyledContainer>
  );
};
