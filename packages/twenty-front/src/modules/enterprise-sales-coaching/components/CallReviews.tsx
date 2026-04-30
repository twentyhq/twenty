import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { CallReviewData } from '../types/coaching.types';
import { GET_SALES_COACHING_DATA } from '../hooks/useSalesCoaching';

const SENT: Record<string, string> = { positive: themeCssVariables.color.green, neutral: themeCssVariables.color.yellow, negative: themeCssVariables.color.red };
const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const SCard = styled.div` padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.light}; border-radius: 8px; display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[2]}; `;
const SHeader = styled.div` display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: ${themeCssVariables.spacing[1]}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; align-items: flex-start; } `;
const SName = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const SScore = styled.span<{ isHigh: boolean }>` padding: 4px 12px; border-radius: 4px; font-size: ${themeCssVariables.font.size.sm}; font-weight: ${themeCssVariables.font.weight.medium}; background: ${({ isHigh }) => isHigh ? themeCssVariables.color.green : themeCssVariables.color.orange}; color: ${themeCssVariables.font.color.inverted}; `;
const SRow = styled.div` display: flex; gap: ${themeCssVariables.spacing[4]}; flex-wrap: wrap; `;
const SMI = styled.div` display: flex; flex-direction: column; gap: 2px; `;
const SML = styled.span` font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.tertiary}; text-transform: uppercase; `;
const SMV = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.primary}; `;
const SDot = styled.span<{ color: string }>` display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${({ color }) => color}; margin-right: 4px; `;

export const CallReviews = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SALES_COACHING_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const reviews: CallReviewData[] = data?.salescoachingData?.reviews ?? [];
  return (
    <SC><ST>{t`Call Reviews`}</ST>{reviews.map((r) => (<SCard key={r.id}><SHeader><SName>{r.repName} &rarr; {r.prospect}</SName><SScore isHigh={r.overallScore >= 80}>{r.overallScore}/100</SScore></SHeader><SRow><SMI><SML>{t`Duration`}</SML><SMV>{r.duration} min</SMV></SMI><SMI><SML>{t`Talk Ratio`}</SML><SMV>{r.talkRatio}%</SMV></SMI><SMI><SML>{t`Questions`}</SML><SMV>{r.questionCount}</SMV></SMI><SMI><SML>{t`Sentiment`}</SML><SMV><SDot color={SENT[r.sentiment] ?? themeCssVariables.color.gray50} />{r.sentiment}</SMV></SMI></SRow></SCard>))}</SC>
  );
};
