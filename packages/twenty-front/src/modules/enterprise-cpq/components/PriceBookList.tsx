import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { PriceBookData } from '../types/cpq.types';
import { GET_CPQ_DATA } from '../hooks/useCPQ';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledBadge = styled.span<{ isActive: boolean }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ isActive }) => isActive ? themeCssVariables.color.green : themeCssVariables.color.gray50}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledResponsiveHide = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledResponsiveHideHeader = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const PriceBookList = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_CPQ_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const books: PriceBookData[] = data?.cpqData?.priceBooks ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Price Books`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Name`}</StyledTh><StyledTh>{t`Currency`}</StyledTh><StyledTh>{t`Status`}</StyledTh><StyledResponsiveHideHeader>{t`Products`}</StyledResponsiveHideHeader><StyledResponsiveHideHeader>{t`Effective`}</StyledResponsiveHideHeader><StyledResponsiveHideHeader>{t`Expires`}</StyledResponsiveHideHeader></tr></thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}><StyledTd>{book.name}</StyledTd><StyledTd>{book.currency}</StyledTd><StyledTd><StyledBadge isActive={book.isActive}>{book.isActive ? t`Active` : t`Inactive`}</StyledBadge></StyledTd><StyledResponsiveHide>{book.productCount}</StyledResponsiveHide><StyledResponsiveHide>{book.effectiveDate}</StyledResponsiveHide><StyledResponsiveHide>{book.expirationDate}</StyledResponsiveHide></tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
