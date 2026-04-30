import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { NRRTrendData } from '../types/revenue.types';

const MOCK_NRR: NRRTrendData[] = [
  { month: 'Nov 2025', nrr: 108, target: 110 },
  { month: 'Dec 2025', nrr: 112, target: 110 },
  { month: 'Jan 2026', nrr: 110, target: 110 },
  { month: 'Feb 2026', nrr: 115, target: 110 },
  { month: 'Mar 2026', nrr: 113, target: 110 },
  { month: 'Apr 2026', nrr: 118, target: 110 },
];

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

const StyledChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${themeCssVariables.spacing[2]};
  height: 160px;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  padding-bottom: ${themeCssVariables.spacing[1]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: 120px;
  }
`;

const StyledBarGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
`;

const StyledBar = styled.div<{ heightPercent: number; isAboveTarget: boolean }>`
  width: 24px;
  height: ${({ heightPercent }) => heightPercent}%;
  background: ${({ isAboveTarget }) =>
    isAboveTarget ? themeCssVariables.color.green : themeCssVariables.color.orange};
  border-radius: 4px 4px 0 0;
  min-height: 8px;
`;

const StyledLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledValue = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledLegend = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledLegendDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${({ color }) => color};
  margin-right: 4px;
  vertical-align: middle;
`;

export const NRRTrend = () => {
  useLingui();
  const minNrr = 100;
  const maxNrr = Math.max(...MOCK_NRR.map((d) => d.nrr));
  const range = maxNrr - minNrr;

  return (
    <StyledContainer>
      <StyledTitle>{t`Net Revenue Retention`}</StyledTitle>
      <StyledChart>
        {MOCK_NRR.map((point) => {
          const heightPercent = Math.round(((point.nrr - minNrr) / range) * 90) + 10;
          return (
            <StyledBarGroup key={point.month}>
              <StyledValue>{point.nrr}%</StyledValue>
              <StyledBar heightPercent={heightPercent} isAboveTarget={point.nrr >= point.target} />
              <StyledLabel>{point.month.slice(0, 3)}</StyledLabel>
            </StyledBarGroup>
          );
        })}
      </StyledChart>
      <StyledLegend>
        <span><StyledLegendDot color={themeCssVariables.color.green} />{t`Above Target`}</span>
        <span><StyledLegendDot color={themeCssVariables.color.orange} />{t`Below Target`}</span>
      </StyledLegend>
    </StyledContainer>
  );
};
