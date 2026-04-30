import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { SkillGapData } from '../types/coaching.types';
import { GET_SALES_COACHING_ANALYTICS } from '../hooks/useSalesCoaching';

const PC: Record<string, string> = { low: themeCssVariables.color.green, medium: themeCssVariables.color.yellow, high: themeCssVariables.color.red };
const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const SRow = styled.div` display: flex; align-items: center; gap: ${themeCssVariables.spacing[3]}; padding: ${themeCssVariables.spacing[2]} 0; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; align-items: flex-start; } `;
const SName = styled.span` font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; min-width: 160px; `;
const SBarC = styled.div` flex: 1; display: flex; gap: 4px; align-items: center; min-width: 200px; `;
const SBar = styled.div<{ width: number; color: string }>` height: 20px; width: ${({ width }) => width}%; background: ${({ color }) => color}; border-radius: 4px; `;
const SLev = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; min-width: 60px; text-align: center; `;
const SPri = styled.span<{ color: string }>` font-size: ${themeCssVariables.font.size.xs}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${({ color }) => color}; text-transform: uppercase; min-width: 50px; `;

export const SkillGaps = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SALES_COACHING_ANALYTICS);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const skills: SkillGapData[] = data?.salescoachingAnalytics?.skills ?? [];
  return (
    <SC><ST>{t`Skill Gap Analysis`}</ST>{skills.map((s) => (<SRow key={s.skill}><SName>{s.skill}</SName><SBarC><SBar width={(s.currentLevel / 10) * 100} color={themeCssVariables.color.blue} /><SBar width={(s.gap / 10) * 100} color={themeCssVariables.background.transparent.lighter} /></SBarC><SLev>{s.currentLevel}/{s.targetLevel}</SLev><SPri color={PC[s.priority] ?? themeCssVariables.color.gray50}>{s.priority}</SPri></SRow>))}</SC>
  );
};
