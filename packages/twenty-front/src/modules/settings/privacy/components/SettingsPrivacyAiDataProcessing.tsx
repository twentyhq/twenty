import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type DataResidencyRegion } from 'twenty-shared/ai';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import {
  IconAlertTriangle,
  type IconComponent,
  IconEyeOff,
  IconMapPin,
  IconWorld,
} from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { workspaceAiModelsSelector } from '@/ai/states/workspaceAiModelsSelector';
import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { StyledSettingsSelectGroup } from '@/settings/components/SettingsOptions/StyledSettingsSelectGroup';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsPrivacyAffectedByAiDataPolicy } from '@/settings/privacy/components/SettingsPrivacyAffectedByAiDataPolicy';
import { useAvailableAiDataPolicyOptions } from '@/settings/privacy/hooks/useAvailableAiDataPolicyOptions';
import { useUpdateWorkspaceAiDataPolicyField } from '@/settings/privacy/hooks/useUpdateWorkspaceAiDataPolicyField';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const WORLDWIDE_OPTION_VALUE = 'worldwide';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type DataResidencyRegionOptionValue =
  | DataResidencyRegion
  | typeof WORLDWIDE_OPTION_VALUE;

export const SettingsPrivacyAiDataProcessing = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const aiModels = useAtomStateValue(aiModelsState);
  const workspaceAiModels = useAtomStateValue(workspaceAiModelsSelector);
  const { updateWorkspaceAiDataPolicyField } =
    useUpdateWorkspaceAiDataPolicyField();

  const aiDataPolicy = getWorkspaceAiDataPolicy(currentWorkspace);
  const { dataResidencyRegions, isZeroDataRetentionAvailable } =
    useAvailableAiDataPolicyOptions();

  const dataResidencyRegionLabels: Record<DataResidencyRegion, string> = {
    eu: t`EU only`,
  };

  const dataResidencyRegionOptions: {
    value: DataResidencyRegionOptionValue;
    label: string;
    Icon: IconComponent;
  }[] = [
    { value: WORLDWIDE_OPTION_VALUE, label: t`Worldwide`, Icon: IconWorld },
    ...dataResidencyRegions.map((value) => ({
      value,
      label: dataResidencyRegionLabels[value],
      Icon: IconMapPin,
    })),
  ];

  const hasNoCompliantModel =
    aiModels.length > 0 && workspaceAiModels.length === 0;

  return (
    <Section.Root>
      <Section.Header
        title={t`AI data processing`}
        description={t`Choose which AI providers may process your requests. Stricter settings leave fewer models, some pricier.`}
      />
      <StyledContent>
        <StyledSettingsSelectGroup controlWidth={160}>
          <Card.Root>
            {dataResidencyRegions.length > 0 && (
              <SettingsOptionCardContentSelect
                Icon={IconWorld}
                title={t`Processing region`}
                description={t`Where AI providers process your requests`}
                divider={isZeroDataRetentionAvailable}
              >
                <Select<DataResidencyRegionOptionValue>
                  dropdownId="settings-privacy-ai-data-residency"
                  value={
                    aiDataPolicy.requiredDataResidencyRegion ??
                    WORLDWIDE_OPTION_VALUE
                  }
                  onChange={(value) =>
                    updateWorkspaceAiDataPolicyField({
                      field: 'requiredDataResidencyRegion',
                      value: value === WORLDWIDE_OPTION_VALUE ? null : value,
                    })
                  }
                  options={dataResidencyRegionOptions}
                  selectSizeVariant="small"
                />
              </SettingsOptionCardContentSelect>
            )}
            {isZeroDataRetentionAvailable && (
              <SettingsOptionCardContentSwitch
                Icon={IconEyeOff}
                title={t`Zero data retention`}
                description={t`Only use providers that keep no copy of your prompts and responses`}
                checked={aiDataPolicy.isZeroDataRetentionRequired}
                onChange={(checked) =>
                  updateWorkspaceAiDataPolicyField({
                    field: 'isZeroDataRetentionRequired',
                    value: checked,
                  })
                }
              />
            )}
          </Card.Root>
        </StyledSettingsSelectGroup>
        {hasNoCompliantModel && (
          <Callout
            status="warning"
            icon={
              <IconAlertTriangle
                size={themeCssVariables.icon.size.md}
                aria-hidden="true"
              />
            }
            fullWidth
            title={t`AI is paused`}
            description={t`No AI model on this workspace meets these settings.`}
          />
        )}
        <SettingsPrivacyAffectedByAiDataPolicy />
      </StyledContent>
    </Section.Root>
  );
};
