import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AccountData } from '../types/accounting.types';

const MOCK_ACCOUNTS: AccountData[] = [
  { id: '1', code: '1000', name: 'Assets', type: 'asset', balance: 520000, currency: 'COP', children: [
    { id: '1a', code: '1100', name: 'Cash', type: 'asset', balance: 180000, currency: 'COP' },
    { id: '1b', code: '1200', name: 'Accounts Receivable', type: 'asset', balance: 340000, currency: 'COP' },
  ]},
  { id: '2', code: '2000', name: 'Liabilities', type: 'liability', balance: 150000, currency: 'COP', children: [
    { id: '2a', code: '2100', name: 'Accounts Payable', type: 'liability', balance: 95000, currency: 'COP' },
    { id: '2b', code: '2200', name: 'Loans Payable', type: 'liability', balance: 55000, currency: 'COP' },
  ]},
  { id: '3', code: '3000', name: 'Equity', type: 'equity', balance: 370000, currency: 'COP' },
  { id: '4', code: '4000', name: 'Revenue', type: 'revenue', balance: 890000, currency: 'COP' },
  { id: '5', code: '5000', name: 'Expenses', type: 'expense', balance: 420000, currency: 'COP' },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledRow = styled.div<{ depth: number }>`
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
  padding-left: calc(${themeCssVariables.spacing[2]} + ${({ depth }) => depth * 20}px);
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  font-size: ${themeCssVariables.font.size.md};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: calc(${themeCssVariables.spacing[1]} + ${({ depth }) => depth * 12}px);
  }
`;

const StyledCode = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  margin-right: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledBalance = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const renderAccount = (account: AccountData, depth: number) => (
  <div key={account.id}>
    <StyledRow depth={depth}>
      <span>
        <StyledCode>{account.code}</StyledCode>
        <StyledName>{account.name}</StyledName>
      </span>
      <StyledBalance>${account.balance.toLocaleString()}</StyledBalance>
    </StyledRow>
    {account.children?.map((child) => renderAccount(child, depth + 1))}
  </div>
);

export const ChartOfAccounts = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Chart of Accounts`}</StyledTitle>
      {MOCK_ACCOUNTS.map((account) => renderAccount(account, 0))}
    </StyledContainer>
  );
};
