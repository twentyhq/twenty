import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PIIRule } from '../types/ai.types';
import { GET_AI_AUDIT_LOG } from '../hooks/useAI';

const MASK_LABELS: Record<string, string> = { redact: 'Redact', hash: 'Hash', partial_mask: 'Partial', tokenize: 'Tokenize' };
const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const StyledPattern = styled.code` font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.tertiary}; background: ${themeCssVariables.background.transparent.lighter}; padding: 2px 4px; border-radius: 3px; `;
const StyledBadge = styled.span<{ color: string }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledToggle = styled.span<{ active: boolean }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ active }) => active ? themeCssVariables.color.turquoise : themeCssVariables.color.gray50}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledHideMobile = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const StyledHideMobileHeader = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const PIIMaskingConfig = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_AI_AUDIT_LOG);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const rules: PIIRule[] = data?.aiAuditLog?.edges?.map((e: { node: PIIRule }) => e.node) ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`PII Masking Rules`}</StyledTitle>
      <StyledTable>
        <thead><tr><StyledTh>{t`Field`}</StyledTh><StyledHideMobileHeader>{t`Pattern`}</StyledHideMobileHeader><StyledTh>{t`Mask Type`}</StyledTh><StyledTh>{t`Active`}</StyledTh><StyledHideMobileHeader>{t`Matches`}</StyledHideMobileHeader></tr></thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <StyledTd>{rule.fieldName}</StyledTd>
              <StyledHideMobile><StyledPattern>{rule.pattern}</StyledPattern></StyledHideMobile>
              <StyledTd><StyledBadge color={themeCssVariables.color.blue}>{MASK_LABELS[rule.maskType] ?? rule.maskType}</StyledBadge></StyledTd>
              <StyledTd><StyledToggle active={rule.isActive}>{rule.isActive ? t`On` : t`Off`}</StyledToggle></StyledTd>
              <StyledHideMobile>{(rule.matchCount ?? 0).toLocaleString()}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
