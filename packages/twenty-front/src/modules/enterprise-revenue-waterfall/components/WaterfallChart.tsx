import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { WaterfallSegment } from '../types/revenue.types';
import { GET_REVENUE_WATERFALL_DATA } from '../hooks/useRevenueWaterfall';

const TC: Record<string, string> = { positive: themeCssVariables.color.green, negative: themeCssVariables.color.red, total: themeCssVariables.color.blue };
const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const SChart = styled.div` display: flex; align-items: flex-end; gap: ${themeCssVariables.spacing[2]}; height: 200px; padding-top: ${themeCssVariables.spacing[4]}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; height: auto; align-items: stretch; } `;
const SBW = styled.div` flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; `;
const SBar = styled.div<{ hp: number; color: string }>` width: 100%; max-width: 60px; height: ${({ hp }) => hp}%; background: ${({ color }) => color}; border-radius: 4px 4px 0 0; min-height: 20px; @media (max-width: ${MOBILE_VIEWPORT}px) { height: 28px; width: ${({ hp }) => hp}%; max-width: none; border-radius: 4px; } `;
const SBL = styled.span` font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.tertiary}; text-align: center; `;
const SBV = styled.span` font-size: ${themeCssVariables.font.size.xs}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;

export const WaterfallChart = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_REVENUE_WATERFALL_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const segments: WaterfallSegment[] = data?.revenuewaterfallData?.segments ?? [];
  const maxVal = Math.max(...segments.map((s) => Math.abs(s.value)), 1);
  return (
    <SC><ST>{t`Revenue Waterfall`}</ST><SChart>{segments.map((s) => { const hp = Math.round((Math.abs(s.value) / maxVal) * 100); return (<SBW key={s.label}><SBV>{s.value < 0 ? '-' : ''}${Math.abs(s.value / 1000).toLocaleString()}k</SBV><SBar hp={hp} color={TC[s.type] ?? themeCssVariables.color.blue} /><SBL>{s.label}</SBL></SBW>); })}</SChart></SC>
  );
};
