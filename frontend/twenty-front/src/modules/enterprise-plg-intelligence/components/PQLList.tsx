import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { PQLData } from '../types/plg.types';
import { GET_PLG_INTELLIGENCE_DATA } from '../hooks/usePLGIntelligence';

const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const STable = styled.table` width: 100%; border-collapse: collapse; `;
const STh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const STd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const SScore = styled.span<{ isHigh: boolean }>` font-weight: ${themeCssVariables.font.weight.medium}; color: ${({ isHigh }) => isHigh ? themeCssVariables.color.green : themeCssVariables.font.color.primary}; `;
const SRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const SRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const PQLList = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_PLG_INTELLIGENCE_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const pqls: PQLData[] = data?.plgintelligenceData?.pqls ?? [];
  return (
    <SC><ST>{t`Product Qualified Leads`}</ST><STable><thead><tr><STh>{t`Account`}</STh><STh>{t`Contact`}</STh><STh>{t`PQL Score`}</STh><SRHH>{t`Top Feature`}</SRHH><SRHH>{t`Plan`}</SRHH></tr></thead><tbody>{pqls.map((p) => (<tr key={p.id}><STd>{p.accountName}</STd><STd>{p.contactName}</STd><STd><SScore isHigh={p.pqlScore >= 80}>{p.pqlScore}</SScore></STd><SRH>{p.topFeature}</SRH><SRH>{p.plan}</SRH></tr>))}</tbody></STable></SC>
  );
};
