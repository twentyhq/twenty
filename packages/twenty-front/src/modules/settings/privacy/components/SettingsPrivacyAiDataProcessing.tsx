import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type AiDataResidencyPolicy } from 'twenty-shared/ai';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconAlertTriangle, IconEyeOff, IconWorld } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { workspaceAiModelsSelector } from '@/ai/states/workspaceAiModelsSelector';
import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAvailableAiDataPolicyOptions } from '@/settings/privacy/hooks/useAvailableAiDataPolicyOptions';
import { useUpdateWorkspacePrivacySettings } from '@/settings/privacy/hooks/useUpdateWorkspacePrivacySettings';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const WORLDWIDE_OPTION_VALUE = 'worldwide';

const StyledCalloutContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[4]};
`;

type AiDataResidencyOptionValue =
  | AiDataResidencyPolicy
  | typeof WORLDWIDE_OPTION_VALUE;

export const SettingsPrivacyAiDataProcessing = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const aiModels = useAtomStateValue(aiModelsState);
  const workspaceAiModels = useAtomStateValue(workspaceAiModelsSelector);
  const { updateWorkspacePrivacySettings } =
    useUpdateWorkspacePrivacySettings();

  const { aiDataResidency, isAiZeroDataRetentionRequired } =
    getWorkspaceAiDataPolicy(currentWorkspace);
  const { aiDataResidencies, isZeroDataRetentionAvailable } =
    useAvailableAiDataPolicyOptions();

  const aiDataResidencyLabels: Record<AiDataResidencyPolicy, string> = {
    eu: t`EU only`,
  };

  const aiDataResidencyOptions: {
    value: AiDataResidencyOptionValue;
    label: string;
  }[] = [
    { value: WORLDWIDE_OPTION_VALUE, label: t`Worldwide` },
    ...aiDataResidencies.map((value) => ({
      value,
      label: aiDataResidencyLabels[value],
    })),
  ];

  const hasNoCompliantModel =
    aiModels.length > 0 && workspaceAiModels.length === 0;

  return (
    <Section.Root>
      <Section.Header
        title={t`AI data processing`}
        description={t`Twenty has no AI model of its own. Choose which providers may process your requests. Stricter settings leave fewer models, and some cost more.`}
      />
      <Card.Root>
        {aiDataResidencies.length > 0 && (
          <SettingsOptionCardContentSelect
            Icon={IconWorld}
            title={t`Processing region`}
            description={t`Where AI providers process your requests`}
            divider={isZeroDataRetentionAvailable}
          >
            <Select<AiDataResidencyOptionValue>
              dropdownId="settings-privacy-ai-data-residency"
              value={aiDataResidency ?? WORLDWIDE_OPTION_VALUE}
              onChange={(value) =>
                updateWorkspacePrivacySettings({
                  aiDataResidency:
                    value === WORLDWIDE_OPTION_VALUE ? null : value,
                })
              }
              options={aiDataResidencyOptions}
              selectSizeVariant="small"
            />
          </SettingsOptionCardContentSelect>
        )}
        {isZeroDataRetentionAvailable && (
          <SettingsOptionCardContentSwitch
            Icon={IconEyeOff}
            title={t`Zero data retention`}
            description={t`Only use providers that keep no copy of your prompts and responses`}
            checked={isAiZeroDataRetentionRequired}
            onChange={(checked) =>
              updateWorkspacePrivacySettings({
                isAiZeroDataRetentionRequired: checked,
              })
            }
          />
        )}
      </Card.Root>
      {hasNoCompliantModel && (
        <StyledCalloutContainer>
          <Callout
            status="warning"
            icon={
              <IconAlertTriangle
                size={themeCssVariables.icon.size.md}
                aria-hidden="true"
              />
            }
            title={t`AI is paused`}
            description={t`No AI model on this workspace meets these settings.`}
          />
        </StyledCalloutContainer>
      )}
    </Section.Root>
  );
};
