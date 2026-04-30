import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { BadgeData } from '../types/gamification.types';
import { GET_GAMIFICATION_DATA } from '../hooks/useGamification';

const RC: Record<string, string> = { common: themeCssVariables.color.gray50, rare: themeCssVariables.color.blue, epic: themeCssVariables.color.orange, legendary: themeCssVariables.color.yellow };
const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const SG = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: ${themeCssVariables.spacing[3]}; @media (max-width: ${MOBILE_VIEWPORT}px) { grid-template-columns: repeat(2, 1fr); } `;
const SCard = styled.div<{ bc: string }>` padding: ${themeCssVariables.spacing[3]}; border: 2px solid ${({ bc }) => bc}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; gap: ${themeCssVariables.spacing[1]}; text-align: center; `;
const SI = styled.span` font-size: 32px; `;
const SN = styled.span` font-size: ${themeCssVariables.font.size.sm}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const SD = styled.span` font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.secondary}; `;
const SR = styled.span<{ color: string }>` font-size: ${themeCssVariables.font.size.xs}; color: ${({ color }) => color}; text-transform: uppercase; font-weight: ${themeCssVariables.font.weight.medium}; `;

export const BadgeGallery = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_GAMIFICATION_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const badges: BadgeData[] = data?.gamificationData?.badges ?? [];
  return (
    <SC><ST>{t`Badges`}</ST><SG>{badges.map((b) => (<SCard key={b.id} bc={RC[b.rarity] ?? themeCssVariables.color.gray50}><SI>{b.icon}</SI><SN>{b.name}</SN><SD>{b.description}</SD><SR color={RC[b.rarity] ?? themeCssVariables.color.gray50}>{b.rarity}</SR></SCard>))}</SG></SC>
  );
};
