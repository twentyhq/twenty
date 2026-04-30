import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { FinancialLineItem } from '../types/accounting.types';

const MOCK_PNL: FinancialLineItem[] = [
  { label: 'Revenue', amount: 890000 },
  { label: 'Cost of Goods Sold', amount: -320000 },
  { label: 'Gross Profit', amount: 570000, isTotal: true },
  { label: 'Operating Expenses', amount: -180000 },
  { label: 'Salaries', amount: -120000 },
  { label: 'Net Income', amount: 270000, isTotal: true },
];

const MOCK_BALANCE_SHEET: FinancialLineItem[] = [
  { label: 'Cash', amount: 180000 },
  { label: 'Accounts Receivable', amount: 340000 },
  { label: 'Total Assets', amount: 520000, isTotal: true },
  { label: 'Accounts Payable', amount: 95000 },
  { label: 'Loans', amount: 55000 },
  { label: 'Total Liabilities', amount: 150000, isTotal: true },
  { label: 'Equity', amount: 370000, isTotal: true },
];

type TabId = 'pnl' | 'balance';

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

const StyledTabs = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledTab = styled.button<{ active: boolean }>`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  background: ${({ active }) =>
    active ? themeCssVariables.color.blue : 'transparent'};
  color: ${({ active }) =>
    active ? themeCssVariables.font.color.inverted : themeCssVariables.font.color.primary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledRow = styled.div<{ isTotal: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
  border-bottom: ${({ isTotal }) =>
    isTotal ? `2px solid ${themeCssVariables.border.color.medium}` : `1px solid ${themeCssVariables.border.color.light}`};
  font-weight: ${({ isTotal }) =>
    isTotal ? themeCssVariables.font.weight.medium : 'normal'};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledAmount = styled.span<{ isNegative: boolean }>`
  color: ${({ isNegative }) =>
    isNegative ? themeCssVariables.color.red : themeCssVariables.font.color.primary};
`;

export const FinancialStatements = () => {
  useLingui();
  const [activeTab, setActiveTab] = useState<TabId>('pnl');

  const data = activeTab === 'pnl' ? MOCK_PNL : MOCK_BALANCE_SHEET;

  return (
    <StyledContainer>
      <StyledTitle>{t`Financial Statements`}</StyledTitle>
      <StyledTabs>
        <StyledTab active={activeTab === 'pnl'} onClick={() => setActiveTab('pnl')}>
          {t`Profit & Loss`}
        </StyledTab>
        <StyledTab active={activeTab === 'balance'} onClick={() => setActiveTab('balance')}>
          {t`Balance Sheet`}
        </StyledTab>
      </StyledTabs>
      {data.map((item, index) => (
        <StyledRow key={index} isTotal={item.isTotal ?? false}>
          <StyledLabel>{item.label}</StyledLabel>
          <StyledAmount isNegative={item.amount < 0}>
            ${Math.abs(item.amount).toLocaleString()}
          </StyledAmount>
        </StyledRow>
      ))}
    </StyledContainer>
  );
};
