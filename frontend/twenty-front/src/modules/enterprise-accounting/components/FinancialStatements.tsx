import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  CLOSE_PERIOD,
  GET_BALANCE_SHEET,
  GET_PROFIT_AND_LOSS,
} from '../hooks/useAccounting';
import { FinancialLineItem } from '../types/accounting.types';

type TabId = 'pnl' | 'balance';
type PeriodType = 'month' | 'quarter' | 'year';

const getDateRange = (period: PeriodType): { startDate: string; endDate: string } => {
  const now = new Date();
  const endDate = now.toISOString().slice(0, 10);
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === 'month') {
    return { startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`, endDate };
  }
  if (period === 'quarter') {
    const quarterStart = Math.floor(month / 3) * 3;
    return { startDate: `${year}-${String(quarterStart + 1).padStart(2, '0')}-01`, endDate };
  }
  return { startDate: `${year}-01-01`, endDate };
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  align-items: center;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
  flex: 1;
`;

const StyledTabs = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
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
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSummary = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  flex-wrap: wrap;
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
`;

const StyledStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledStatLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

const StyledStatValue = styled.span<{ highlight?: boolean }>`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ highlight }) =>
    highlight ? themeCssVariables.color.turquoise : themeCssVariables.font.color.primary};
`;

const StyledRow = styled.div<{ isTotal: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
  border-bottom: ${({ isTotal }) =>
    isTotal
      ? `2px solid ${themeCssVariables.border.color.medium}`
      : `1px solid ${themeCssVariables.border.color.light}`};
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

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const FinancialStatements = () => {
  useLingui();

  const [activeTab, setActiveTab] = useState<TabId>('pnl');
  const [period, setPeriod] = useState<PeriodType>('year');

  const { startDate, endDate } = getDateRange(period);

  const {
    data: pnlData,
    loading: pnlLoading,
    error: pnlError,
  } = useQuery(GET_PROFIT_AND_LOSS, {
    variables: { startDate, endDate },
  });

  const {
    data: bsData,
    loading: bsLoading,
    error: bsError,
  } = useQuery(GET_BALANCE_SHEET, {
    variables: { asOfDate: endDate },
  });

  const [closePeriod, { loading: closing }] = useMutation(CLOSE_PERIOD);

  const handleClosePeriod = () => {
    const periodId = prompt('Enter period ID to close:');
    if (periodId) {
      closePeriod({ variables: { periodId } });
    }
  };

  const isLoading = pnlLoading || bsLoading;
  const queryError = pnlError || bsError;

  if (isLoading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (queryError)
    return <StyledError>{t`Error: ${queryError.message}`}</StyledError>;

  const pnl = pnlData?.profitAndLoss;
  const bs = bsData?.balanceSheet;

  const pnlItems: FinancialLineItem[] = [
    ...(pnl?.revenue ?? []),
    ...(pnl?.costOfSales ?? []),
    ...(pnl?.operatingExpenses ?? []),
  ];

  const bsItems: FinancialLineItem[] = [
    ...(bs?.assets ?? []),
    ...(bs?.liabilities ?? []),
    ...(bs?.equity ?? []),
  ];

  const items = activeTab === 'pnl' ? pnlItems : bsItems;

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledTitle>{t`Financial Statements`}</StyledTitle>
        <StyledSelect
          value={period}
          onChange={(event) => setPeriod(event.target.value as PeriodType)}
        >
          <option value="month">{t`This Month`}</option>
          <option value="quarter">{t`This Quarter`}</option>
          <option value="year">{t`This Year`}</option>
        </StyledSelect>
        <StyledTab active={false} onClick={handleClosePeriod}>
          {closing ? t`Closing...` : t`Close Period`}
        </StyledTab>
      </StyledToolbar>

      <StyledTabs>
        <StyledTab
          active={activeTab === 'pnl'}
          onClick={() => setActiveTab('pnl')}
        >
          {t`Profit & Loss`}
        </StyledTab>
        <StyledTab
          active={activeTab === 'balance'}
          onClick={() => setActiveTab('balance')}
        >
          {t`Balance Sheet`}
        </StyledTab>
      </StyledTabs>

      {activeTab === 'pnl' && pnl && (
        <StyledSummary>
          <StyledStat>
            <StyledStatLabel>{t`Gross Profit`}</StyledStatLabel>
            <StyledStatValue>
              ${(pnl.grossProfit ?? 0).toLocaleString()}
            </StyledStatValue>
          </StyledStat>
          <StyledStat>
            <StyledStatLabel>{t`Operating Income`}</StyledStatLabel>
            <StyledStatValue>
              ${(pnl.operatingIncome ?? 0).toLocaleString()}
            </StyledStatValue>
          </StyledStat>
          <StyledStat>
            <StyledStatLabel>{t`Net Income`}</StyledStatLabel>
            <StyledStatValue highlight>
              ${(pnl.netIncome ?? 0).toLocaleString()}
            </StyledStatValue>
          </StyledStat>
        </StyledSummary>
      )}

      {activeTab === 'balance' && bs && (
        <StyledSummary>
          <StyledStat>
            <StyledStatLabel>{t`Total Assets`}</StyledStatLabel>
            <StyledStatValue>
              ${(bs.totalAssets ?? 0).toLocaleString()}
            </StyledStatValue>
          </StyledStat>
          <StyledStat>
            <StyledStatLabel>{t`Liabilities + Equity`}</StyledStatLabel>
            <StyledStatValue>
              ${(bs.totalLiabilitiesAndEquity ?? 0).toLocaleString()}
            </StyledStatValue>
          </StyledStat>
          <StyledStat>
            <StyledStatLabel>{t`Balanced`}</StyledStatLabel>
            <StyledStatValue highlight={bs.isBalanced}>
              {bs.isBalanced ? t`Yes` : t`No`}
            </StyledStatValue>
          </StyledStat>
        </StyledSummary>
      )}

      {items.map((item, index) => (
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
