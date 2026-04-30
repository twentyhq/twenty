import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { FeatureUsageData } from '../types/plg.types';
import { GET_PLG_INTELLIGENCE_DATA } from '../hooks/usePLGIntelligence';

const IC: Record<string, string> = { low: themeCssVariables.color.gray50, medium: themeCssVariables.color.yellow, high: themeCssVariables.color.green };
const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const STable = styled.table` width: 100%; border-collapse: collapse; `;
const STh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const STd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const SDot = styled.span<{ color: string }>` display: inline-block; width: 12px; height: 12px; border-radius: 2px; background: ${({ color }) => color}; margin-right: 6px; vertical-align: middle; `;
const SRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const SRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const ProductUsage = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_PLG_INTELLIGENCE_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const features: FeatureUsageData[] = data?.plgintelligenceData?.features ?? [];
  return (
    <SC><ST>{t`Feature Usage`}</ST><STable><thead><tr><STh>{t`Feature`}</STh><STh>{t`Adoption`}</STh><STh>{t`DAU`}</STh><SRHH>{t`WAU`}</SRHH><SRHH>{t`Intensity`}</SRHH></tr></thead><tbody>{features.map((f) => (<tr key={f.featureName}><STd>{f.featureName}</STd><STd>{f.adoptionRate}%</STd><STd>{f.dailyActiveUsers.toLocaleString()}</STd><SRH>{f.weeklyActiveUsers.toLocaleString()}</SRH><SRH><SDot color={IC[f.intensity] ?? themeCssVariables.color.gray50} />{f.intensity}</SRH></tr>))}</tbody></STable></SC>
  );
};
