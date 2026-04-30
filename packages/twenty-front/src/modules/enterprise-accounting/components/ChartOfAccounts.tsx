import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AccountData } from '../types/accounting.types';
import { GET_TRIAL_BALANCE } from '../hooks/useAccounting';

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
  const { data, loading, error } = useQuery(GET_TRIAL_BALANCE, {
    variables: { asOfDate: new Date().toISOString().slice(0, 10) },
  });

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const accounts: AccountData[] = data?.trialBalance?.accounts ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Chart of Accounts`}</StyledTitle>
      {accounts.map((account) => renderAccount(account, 0))}
    </StyledContainer>
  );
};
