import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AssetData, AssetStatus } from '../types/assets.types';
import { GET_IT_ASSET_MANAGEMENT_DATA } from '../hooks/useItAssetManagement';

const SCC: Record<AssetStatus, string> = { active: themeCssVariables.color.green, maintenance: themeCssVariables.color.yellow, retired: themeCssVariables.color.gray50, disposed: themeCssVariables.color.red };
const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const STable = styled.table` width: 100%; border-collapse: collapse; `;
const STh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const STd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const SBadge = styled.span<{ color: string }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; font-weight: ${themeCssVariables.font.weight.medium}; background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted}; `;

export const AssetRegistry = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_IT_ASSET_MANAGEMENT_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const assets: AssetData[] = data?.itassetmanagementData?.assets ?? [];
  return (
    <SC><ST>{t`IT Asset Registry`}</ST><STable><thead><tr><STh>{t`ID`}</STh><STh>{t`Name`}</STh><STh>{t`Type`}</STh><STh>{t`Assignee`}</STh><STh>{t`Status`}</STh></tr></thead><tbody>{assets.map((a) => (<tr key={a.id}><STd>{a.id}</STd><STd>{a.name}</STd><STd>{a.type}</STd><STd>{a.assignee}</STd><STd><SBadge color={SCC[a.status]}>{a.status}</SBadge></STd></tr>))}</tbody></STable></SC>
  );
};
