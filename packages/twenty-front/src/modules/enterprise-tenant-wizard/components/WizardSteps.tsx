import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { WizardStepData, WizardStepStatus } from '../types/wizard.types';
import { GET_TENANT_WIZARD_DATA } from '../hooks/useTenantWizard';

const SCC: Record<WizardStepStatus, string> = { pending: themeCssVariables.color.gray50, active: themeCssVariables.color.blue, completed: themeCssVariables.color.green, skipped: themeCssVariables.color.yellow };
const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const SCard = styled.div<{ isActive: boolean }>` display: flex; align-items: center; gap: ${themeCssVariables.spacing[3]}; padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${({ isActive }) => isActive ? themeCssVariables.color.blue : themeCssVariables.border.color.light}; border-radius: 8px; background: ${({ isActive }) => isActive ? 'rgba(0, 120, 255, 0.04)' : 'transparent'}; `;
const SNum = styled.div<{ color: string }>` width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: ${themeCssVariables.font.size.sm}; font-weight: ${themeCssVariables.font.weight.semiBold}; background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted}; flex-shrink: 0; `;
const SContent = styled.div` display: flex; flex-direction: column; gap: 2px; `;
const STitle = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const SDesc = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; `;

export const WizardSteps = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_TENANT_WIZARD_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const steps: WizardStepData[] = data?.tenantwizardData?.steps ?? [];
  return (
    <SC><ST>{t`Tenant Setup Wizard`}</ST>{steps.map((s) => (<SCard key={s.id} isActive={s.status === 'active'}><SNum color={SCC[s.status]}>{s.order}</SNum><SContent><STitle>{s.title}{s.isOptional ? ` (${t`optional`})` : ''}</STitle><SDesc>{s.description}</SDesc></SContent></SCard>))}</SC>
  );
};
