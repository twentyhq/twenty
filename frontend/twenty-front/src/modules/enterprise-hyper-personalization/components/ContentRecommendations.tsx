import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { ContentRecommendationData } from '../types/personalization.types';
import { GET_HYPER_PERSONALIZATION_ANALYTICS } from '../hooks/useHyperPersonalization';

const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const STable = styled.table` width: 100%; border-collapse: collapse; `;
const STh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const STd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const SBadge = styled.span` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${themeCssVariables.background.transparent.lighter}; color: ${themeCssVariables.font.color.tertiary}; text-transform: uppercase; `;
const SRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const SRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const ContentRecommendations = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_HYPER_PERSONALIZATION_ANALYTICS);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const recs: ContentRecommendationData[] = data?.hyperpersonalizationAnalytics?.recommendations ?? [];
  return (
    <SC><ST>{t`Content Recommendations`}</ST><STable><thead><tr><STh>{t`Content`}</STh><STh>{t`Type`}</STh><STh>{t`Relevance`}</STh><SRHH>{t`Views`}</SRHH><SRHH>{t`Conversions`}</SRHH></tr></thead><tbody>{recs.map((r) => (<tr key={r.id}><STd>{r.title}</STd><STd><SBadge>{r.contentType.replace('_', ' ')}</SBadge></STd><STd>{r.relevanceScore}%</STd><SRH>{r.views.toLocaleString()}</SRH><SRH>{r.conversions}</SRH></tr>))}</tbody></STable></SC>
  );
};
