import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AttributionModel, TouchPoint } from '../types/marketing.types';
import { GET_ATTRIBUTION_DATA } from '../hooks/useMarketing';

const BAR_COLORS = [themeCssVariables.color.blue, themeCssVariables.color.turquoise, themeCssVariables.color.yellow, themeCssVariables.color.orange, themeCssVariables.color.red];
const MODELS: AttributionModel[] = ['first_touch', 'last_touch', 'linear', 'time_decay'];

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledModelSelect = styled.select` padding: ${themeCssVariables.spacing[2]}; border: 1px solid ${themeCssVariables.border.color.medium}; border-radius: 4px; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; background: ${themeCssVariables.background.transparent.lighter}; align-self: flex-start; `;
const StyledList = styled.div` display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[2]}; `;
const StyledRow = styled.div` display: flex; align-items: center; gap: ${themeCssVariables.spacing[3]}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; align-items: flex-start; gap: ${themeCssVariables.spacing[1]}; } `;
const StyledChannel = styled.span` font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; min-width: 120px; `;
const StyledBarContainer = styled.div` flex: 1; height: 24px; background: ${themeCssVariables.background.transparent.lighter}; border-radius: 4px; overflow: hidden; min-width: 200px; `;
const StyledBar = styled.div<{ width: number; color: string }>` height: 100%; width: ${({ width }) => width}%; background: ${({ color }) => color}; border-radius: 4px; display: flex; align-items: center; padding-left: ${themeCssVariables.spacing[1]}; font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledRevenue = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; min-width: 120px; text-align: right; `;

export const AttributionView = () => {
  useLingui();
  const [model, setModel] = useState<AttributionModel>('linear');
  const { data, loading, error } = useQuery(GET_ATTRIBUTION_DATA, { variables: { model } });
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const touchpoints: TouchPoint[] = data?.attributionData?.touchpoints ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Multi-Touch Attribution`}</StyledTitle>
      <StyledModelSelect value={model} onChange={(e) => setModel(e.target.value as AttributionModel)}>
        {MODELS.map((m) => (<option key={m} value={m}>{m.replace('_', ' ')}</option>))}
      </StyledModelSelect>
      <StyledList>
        {touchpoints.map((tp, index) => (
          <StyledRow key={tp.channel}>
            <StyledChannel>{tp.channel}</StyledChannel>
            <StyledBarContainer><StyledBar width={tp.weight * 3} color={BAR_COLORS[index % BAR_COLORS.length]}>{tp.weight}%</StyledBar></StyledBarContainer>
            <StyledRevenue>${tp.revenue.toLocaleString()}</StyledRevenue>
          </StyledRow>
        ))}
      </StyledList>
    </StyledContainer>
  );
};
