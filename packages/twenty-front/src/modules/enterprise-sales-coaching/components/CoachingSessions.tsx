import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { CoachingSessionData } from '../types/coaching.types';
import { GET_SALES_COACHING_DATA } from '../hooks/useSalesCoaching';

const SCC: Record<string, string> = { scheduled: themeCssVariables.color.blue, completed: themeCssVariables.color.green, cancelled: themeCssVariables.color.gray50 };
const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const STable = styled.table` width: 100%; border-collapse: collapse; `;
const STh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const STd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const SBadge = styled.span<{ color: string }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted}; `;
const SRH = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;
const SRHH = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; } `;

export const CoachingSessions = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SALES_COACHING_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const sessions: CoachingSessionData[] = data?.salescoachingData?.sessions ?? [];
  return (
    <SC><ST>{t`Coaching Sessions`}</ST><STable><thead><tr><STh>{t`Rep`}</STh><STh>{t`Topic`}</STh><STh>{t`Status`}</STh><SRHH>{t`Coach`}</SRHH><SRHH>{t`Date`}</SRHH></tr></thead><tbody>{sessions.map((s) => (<tr key={s.id}><STd>{s.repName}</STd><STd>{s.topic}</STd><STd><SBadge color={SCC[s.status] ?? themeCssVariables.color.gray50}>{s.status}</SBadge></STd><SRH>{s.coachName}</SRH><SRH>{new Date(s.scheduledAt).toLocaleDateString()}</SRH></tr>))}</tbody></STable></SC>
  );
};
