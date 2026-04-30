import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { PersonalizationRuleData } from '../types/personalization.types';
import { GET_HYPER_PERSONALIZATION_DATA } from '../hooks/useHyperPersonalization';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledBadge = styled.span<{ isActive: boolean }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ isActive }) => isActive ? themeCssVariables.color.green : themeCssVariables.color.gray50}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const PersonalizationRules = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_HYPER_PERSONALIZATION_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const rules: PersonalizationRuleData[] = data?.hyperpersonalizationData?.rules ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Personalization Rules`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Rule`}</StyledTh><StyledTh>{t`Segment`}</StyledTh><StyledTh>{t`Status`}</StyledTh><StyledRHH>{t`Condition`}</StyledRHH><StyledRHH>{t`Action`}</StyledRHH></tr></thead>
        <tbody>{rules.map((r) => (<tr key={r.id}><StyledTd>{r.name}</StyledTd><StyledTd>{r.segment}</StyledTd><StyledTd><StyledBadge isActive={r.isActive}>{r.isActive ? t`Active` : t`Inactive`}</StyledBadge></StyledTd><StyledRH>{r.condition}</StyledRH><StyledRH>{r.action}</StyledRH></tr>))}</tbody>
      </StyledTable>
    </StyledContainer>
  );
};
