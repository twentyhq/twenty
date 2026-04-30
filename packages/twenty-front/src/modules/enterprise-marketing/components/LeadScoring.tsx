import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { LeadScoreRule } from '../types/marketing.types';
import { GET_LEAD_SCORING_RULES } from '../hooks/useMarketing';

const StyledContainer = styled.div`
  display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]};
`;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledPoints = styled.span<{ points: number }>` font-weight: ${themeCssVariables.font.weight.medium}; color: ${({ points }) => points >= 25 ? themeCssVariables.color.turquoise : points >= 10 ? themeCssVariables.color.blue : themeCssVariables.font.color.secondary}; `;
const StyledToggle = styled.span<{ active: boolean }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ active }) => active ? themeCssVariables.color.turquoise : themeCssVariables.color.gray50}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledHideMobile = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledHideMobileHeader = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const LeadScoring = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_LEAD_SCORING_RULES);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const rules: LeadScoreRule[] = data?.leadScoringRules?.rules ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Lead Scoring Rules`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Attribute`}</StyledTh><StyledTh>{t`Condition`}</StyledTh><StyledHideMobileHeader>{t`Value`}</StyledHideMobileHeader><StyledTh>{t`Points`}</StyledTh><StyledTh>{t`Active`}</StyledTh></tr></thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <StyledTd>{rule.attribute}</StyledTd><StyledTd>{rule.condition}</StyledTd>
              <StyledHideMobile>{rule.value}</StyledHideMobile>
              <StyledTd><StyledPoints points={rule.points}>+{rule.points}</StyledPoints></StyledTd>
              <StyledTd><StyledToggle active={rule.isActive}>{rule.isActive ? t`On` : t`Off`}</StyledToggle></StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
