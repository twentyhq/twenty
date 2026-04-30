import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { WaterfallSegment } from '../types/revenue.types';

const MOCK_SEGMENTS: WaterfallSegment[] = [
  { label: 'Starting ARR', value: 2400000, type: 'total' },
  { label: 'New Business', value: 380000, type: 'positive' },
  { label: 'Expansion', value: 220000, type: 'positive' },
  { label: 'Contraction', value: -85000, type: 'negative' },
  { label: 'Churn', value: -145000, type: 'negative' },
  { label: 'Ending ARR', value: 2770000, type: 'total' },
];

const TYPE_COLORS: Record<string, string> = {
  positive: themeCssVariables.color.green,
  negative: themeCssVariables.color.red,
  total: themeCssVariables.color.blue,
};

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
  height: 200px;
  padding-top: ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    height: auto;
    align-items: stretch;
  }
`;

const StyledBarWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
`;

const StyledBar = styled.div<{ heightPercent: number; color: string }>`
  width: 100%;
  max-width: 60px;
  height: ${({ heightPercent }) => heightPercent}%;
  background: ${({ color }) => color};
  border-radius: 4px 4px 0 0;
  min-height: 20px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: 28px;
    width: ${({ heightPercent }) => heightPercent}%;
    max-width: none;
    border-radius: 4px;
  }
`;

const StyledBarLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-align: center;
`;

const StyledBarValue = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

export const WaterfallChart = () => {
  useLingui();
  const maxValue = Math.max(...MOCK_SEGMENTS.map((s) => Math.abs(s.value)));

  return (
    <StyledContainer>
      <StyledTitle>{t`Revenue Waterfall`}</StyledTitle>
      <StyledChart>
        {MOCK_SEGMENTS.map((segment) => {
          const heightPercent = Math.round((Math.abs(segment.value) / maxValue) * 100);
          return (
            <StyledBarWrapper key={segment.label}>
              <StyledBarValue>
                {segment.value < 0 ? '-' : ''}${Math.abs(segment.value / 1000).toLocaleString()}k
              </StyledBarValue>
              <StyledBar heightPercent={heightPercent} color={TYPE_COLORS[segment.type]} />
              <StyledBarLabel>{segment.label}</StyledBarLabel>
            </StyledBarWrapper>
          );
        })}
      </StyledChart>
    </StyledContainer>
  );
};
