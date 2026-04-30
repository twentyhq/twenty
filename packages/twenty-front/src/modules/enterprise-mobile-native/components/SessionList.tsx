import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { MobileSessionData } from '../types/mobile.types';
import { GET_MOBILE_NATIVE_DATA } from '../hooks/useMobileNative';

const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const STable = styled.table` width: 100%; border-collapse: collapse; `;
const STh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const STd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const SDot = styled.span<{ isOnline: boolean }>` display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; background: ${({ isOnline }) => isOnline ? themeCssVariables.color.green : themeCssVariables.color.gray50}; `;

export const SessionList = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_MOBILE_NATIVE_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const sessions: MobileSessionData[] = data?.mobilenativeData?.sessions ?? [];
  return (
    <SC><ST>{t`Mobile Sessions`}</ST><STable><thead><tr><STh>{t`User`}</STh><STh>{t`Device`}</STh><STh>{t`OS`}</STh><STh>{t`App Version`}</STh><STh>{t`Status`}</STh></tr></thead><tbody>{sessions.map((s) => (<tr key={s.id}><STd>{s.userName}</STd><STd>{s.device}</STd><STd>{s.os}</STd><STd>{s.appVersion}</STd><STd><SDot isOnline={s.isOnline} />{s.isOnline ? t`Online` : t`Offline`}</STd></tr>))}</tbody></STable></SC>
  );
};
