import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PIIRule } from '../types/ai.types';

const MOCK_RULES: PIIRule[] = [
  { id: 'PII1', fieldName: 'Email Address', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+', maskType: 'redact', isActive: true, matchCount: 4520 },
  { id: 'PII2', fieldName: 'Phone Number', pattern: '\\+?[0-9]{10,15}', maskType: 'partial_mask', isActive: true, matchCount: 2100 },
  { id: 'PII3', fieldName: 'Credit Card', pattern: '[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}[- ]?[0-9]{4}', maskType: 'tokenize', isActive: true, matchCount: 350 },
  { id: 'PII4', fieldName: 'National ID (CC)', pattern: '[0-9]{6,12}', maskType: 'hash', isActive: false, matchCount: 890 },
  { id: 'PII5', fieldName: 'Home Address', pattern: 'Calle|Carrera|Avenida.*[0-9]+', maskType: 'redact', isActive: true, matchCount: 1200 },
];

const MASK_LABELS: Record<string, string> = {
  redact: 'Redact',
  hash: 'Hash',
  partial_mask: 'Partial',
  tokenize: 'Tokenize',
};

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

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledPattern = styled.code`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  background: ${themeCssVariables.background.transparent.lighter};
  padding: 2px 4px;
  border-radius: 3px;
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledToggle = styled.span<{ active: boolean }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ active }) =>
    active ? themeCssVariables.color.turquoise : themeCssVariables.color.gray50};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const PIIMaskingConfig = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`PII Masking Rules`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Field`}</StyledTh>
            <StyledHideMobileHeader>{t`Pattern`}</StyledHideMobileHeader>
            <StyledTh>{t`Mask Type`}</StyledTh>
            <StyledTh>{t`Active`}</StyledTh>
            <StyledHideMobileHeader>{t`Matches`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_RULES.map((rule) => (
            <tr key={rule.id}>
              <StyledTd>{rule.fieldName}</StyledTd>
              <StyledHideMobile><StyledPattern>{rule.pattern}</StyledPattern></StyledHideMobile>
              <StyledTd>
                <StyledBadge color={themeCssVariables.color.blue}>{MASK_LABELS[rule.maskType]}</StyledBadge>
              </StyledTd>
              <StyledTd>
                <StyledToggle active={rule.isActive}>{rule.isActive ? t`On` : t`Off`}</StyledToggle>
              </StyledTd>
              <StyledHideMobile>{rule.matchCount.toLocaleString()}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
