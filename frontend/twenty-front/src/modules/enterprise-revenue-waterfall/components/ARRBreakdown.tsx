import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { ARRBreakdownData } from '../types/revenue.types';
import { GET_REVENUE_WATERFALL_DATA } from '../hooks/useRevenueWaterfall';

const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const STable = styled.table` width: 100%; border-collapse: collapse; `;
const STh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const STd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const SP = styled.span` color: ${themeCssVariables.color.green}; `;
const SN = styled.span` color: ${themeCssVariables.color.red}; `;
const SRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const SRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const fmt = (v: number) => { const p = v < 0 ? '-' : '+'; return `${p}$${Math.abs(v / 1000)}k`; };

export const ARRBreakdown = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_REVENUE_WATERFALL_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const rows: ARRBreakdownData[] = data?.revenuewaterfallData?.breakdown ?? [];
  return (
    <SC><ST>{t`ARR Breakdown`}</ST><STable><thead><tr><STh>{t`Period`}</STh><STh>{t`New`}</STh><STh>{t`Expansion`}</STh><SRHH>{t`Contraction`}</SRHH><SRHH>{t`Churn`}</SRHH><STh>{t`Ending ARR`}</STh></tr></thead><tbody>{rows.map((r) => (<tr key={r.period}><STd>{r.period}</STd><STd><SP>{fmt(r.newBusiness)}</SP></STd><STd><SP>{fmt(r.expansion)}</SP></STd><SRH><SN>{fmt(r.contraction)}</SN></SRH><SRH><SN>{fmt(r.churn)}</SN></SRH><STd>${(r.endingARR / 1000).toLocaleString()}k</STd></tr>))}</tbody></STable></SC>
  );
};
