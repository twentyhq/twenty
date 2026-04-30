import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { TrialConversionData } from '../types/plg.types';
import { GET_PLG_INTELLIGENCE_ANALYTICS } from '../hooks/usePLGIntelligence';

const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const SStep = styled.div` display: flex; align-items: center; gap: ${themeCssVariables.spacing[3]}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; align-items: flex-start; } `;
const SLabel = styled.span` font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; min-width: 160px; `;
const SBarC = styled.div` flex: 1; height: 28px; background: ${themeCssVariables.background.transparent.lighter}; border-radius: 4px; overflow: hidden; position: relative; min-width: 200px; `;
const SBarF = styled.div<{ percentage: number }>` height: 100%; width: ${({ percentage }) => percentage}%; background: ${themeCssVariables.color.blue}; border-radius: 4px; display: flex; align-items: center; padding-left: ${themeCssVariables.spacing[2]}; `;
const SBarL = styled.span` font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.inverted}; white-space: nowrap; `;
const SMeta = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; min-width: 80px; text-align: right; `;

export const TrialConversions = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_PLG_INTELLIGENCE_ANALYTICS);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const funnel: TrialConversionData[] = data?.plgintelligenceAnalytics?.funnel ?? [];
  const maxCount = funnel.length > 0 ? funnel[0].count : 1;
  return (
    <SC><ST>{t`Trial Conversion Funnel`}</ST>{funnel.map((step) => { const wp = Math.round((step.count / maxCount) * 100); return (<SStep key={step.stage}><SLabel>{step.stage}</SLabel><SBarC><SBarF percentage={wp}><SBarL>{step.count.toLocaleString()}</SBarL></SBarF></SBarC><SMeta>{step.conversionRate}%</SMeta></SStep>); })}</SC>
  );
};
