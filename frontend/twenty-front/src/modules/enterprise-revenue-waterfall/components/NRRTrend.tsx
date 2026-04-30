import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { NRRTrendData } from '../types/revenue.types';
import { GET_REVENUE_WATERFALL_ANALYTICS } from '../hooks/useRevenueWaterfall';

const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const SChart = styled.div` display: flex; align-items: flex-end; gap: ${themeCssVariables.spacing[2]}; height: 160px; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; padding-bottom: ${themeCssVariables.spacing[1]}; @media (max-width: ${MOBILE_VIEWPORT}px) { height: 120px; } `;
const SBG = styled.div` flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; `;
const SBar = styled.div<{ hp: number; above: boolean }>` width: 24px; height: ${({ hp }) => hp}%; background: ${({ above }) => above ? themeCssVariables.color.green : themeCssVariables.color.orange}; border-radius: 4px 4px 0 0; min-height: 8px; `;
const SL = styled.span` font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.tertiary}; `;
const SV = styled.span` font-size: ${themeCssVariables.font.size.xs}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const SLeg = styled.div` display: flex; gap: ${themeCssVariables.spacing[4]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; `;
const SDot = styled.span<{ color: string }>` display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${({ color }) => color}; margin-right: 4px; vertical-align: middle; `;

export const NRRTrend = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_REVENUE_WATERFALL_ANALYTICS);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const points: NRRTrendData[] = data?.revenuewaterfallAnalytics?.nrr ?? [];
  const maxNrr = Math.max(...points.map((d) => d.nrr), 101);
  const range = maxNrr - 100;
  return (
    <SC><ST>{t`Net Revenue Retention`}</ST><SChart>{points.map((p) => { const hp = Math.round(((p.nrr - 100) / range) * 90) + 10; return (<SBG key={p.month}><SV>{p.nrr}%</SV><SBar hp={hp} above={p.nrr >= p.target} /><SL>{p.month.slice(0, 3)}</SL></SBG>); })}</SChart><SLeg><span><SDot color={themeCssVariables.color.green} />{t`Above Target`}</span><span><SDot color={themeCssVariables.color.orange} />{t`Below Target`}</span></SLeg></SC>
  );
};
