import { useState } from 'react';
import styled from '@emotion/styled';

import { DEFAULT_FAST_MODEL } from '@/ai/constants/DefaultFastModel';
import { DEFAULT_SMART_MODEL } from '@/ai/constants/DefaultSmartModel';
import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { t } from '@lingui/core/macro';
import {
  H2Title,
  IconBolt,
  IconRobot,
  IconSearch,
  IconTwentyStar,
} from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';
import { getModelIcon } from '~/pages/settings/ai/utils/getModelIcon';
import { getModelProviderLabel } from '~/pages/settings/ai/utils/getModelProviderLabel';

const StyledSearchContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  width: 100%;
`;

export const SettingsAIModelsTab = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilStateV2(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const aiModels = useRecoilValueV2(aiModelsState);

  const {
    allModelsWithAvailability,
    enabledModels,
    useRecommendedModels,
    autoEnableNewAiModels,
    realModels,
  } = useWorkspaceAiModelAvailability();

  const currentSmartModel = currentWorkspace?.smartModel;
  const currentFastModel = currentWorkspace?.fastModel;

  const buildVirtualModelOption = (virtualModelId: string) => {
    const virtualModel = aiModels.find(
      (model) => model.modelId === virtualModelId,
    );

    return virtualModel
      ? {
          value: virtualModelId,
          label: virtualModel.label,
          Icon: IconTwentyStar,
        }
      : null;
  };

  const smartAutoOption = buildVirtualModelOption(DEFAULT_SMART_MODEL);
  const fastAutoOption = buildVirtualModelOption(DEFAULT_FAST_MODEL);

  const modelOptions = enabledModels.map((model) => ({
    value: model.modelId,
    label: model.label,
    Icon: getModelIcon(model.modelFamily),
  }));

  const smartModelOptions = [...modelOptions];

  if (smartAutoOption !== null) {
    smartModelOptions.unshift(smartAutoOption);
  }

  const fastModelOptions = [...modelOptions];

  if (fastAutoOption !== null) {
    fastModelOptions.unshift(fastAutoOption);
  }

  const handleModelFieldChange = async (
    field: 'smartModel' | 'fastModel',
    value: string,
  ) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousValue = currentWorkspace[field];

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        [field]: value,
      });

      await updateWorkspace({
        variables: {
          input: {
            [field]: value,
          },
        },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        [field]: previousValue,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update model`,
      });
    }
  };

  const handleUseRecommendedToggle = async (checked: boolean) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousValue = currentWorkspace.useRecommendedModels;

    let newEnabledIds = currentWorkspace.enabledAiModelIds ?? [];

    if (!checked && previousValue) {
      const recommendedModelIds = realModels
        .filter((model) => model.isRecommended)
        .map((model) => model.modelId);

      newEnabledIds = recommendedModelIds;
    }

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        useRecommendedModels: checked,
        enabledAiModelIds: newEnabledIds,
      });

      await updateWorkspace({
        variables: {
          input: {
            useRecommendedModels: checked,
            enabledAiModelIds: newEnabledIds,
          },
        },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        useRecommendedModels: previousValue,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update model selection mode`,
      });
    }
  };

  const handleAutoEnableToggle = async (checked: boolean) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousAutoEnable = currentWorkspace.autoEnableNewAiModels;
    const previousDisabled = currentWorkspace.disabledAiModelIds ?? [];
    const previousEnabled = currentWorkspace.enabledAiModelIds ?? [];

    let newDisabledIds: string[] = [];
    let newEnabledIds: string[] = [];

    if (checked) {
      newDisabledIds = realModels
        .filter((model) => !previousEnabled.includes(model.modelId))
        .map((model) => model.modelId);
      newEnabledIds = [];
    } else {
      newEnabledIds = realModels
        .filter((model) => !previousDisabled.includes(model.modelId))
        .map((model) => model.modelId);
      newDisabledIds = [];
    }

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        autoEnableNewAiModels: checked,
        disabledAiModelIds: newDisabledIds,
        enabledAiModelIds: newEnabledIds,
      });

      await updateWorkspace({
        variables: {
          input: {
            autoEnableNewAiModels: checked,
            disabledAiModelIds: newDisabledIds,
            enabledAiModelIds: newEnabledIds,
          },
        },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        autoEnableNewAiModels: previousAutoEnable,
        disabledAiModelIds: previousDisabled,
        enabledAiModelIds: previousEnabled,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update model availability settings`,
      });
    }
  };

  const handleModelToggle = async (
    modelId: string,
    isCurrentlyEnabled: boolean,
  ) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousDisabled = currentWorkspace.disabledAiModelIds ?? [];
    const previousEnabled = currentWorkspace.enabledAiModelIds ?? [];

    let newDisabledIds = [...previousDisabled];
    let newEnabledIds = [...previousEnabled];

    if (autoEnableNewAiModels) {
      if (isCurrentlyEnabled) {
        newDisabledIds = [...previousDisabled, modelId];
      } else {
        newDisabledIds = previousDisabled.filter((id) => id !== modelId);
      }
    } else {
      if (isCurrentlyEnabled) {
        newEnabledIds = previousEnabled.filter((id) => id !== modelId);
      } else {
        newEnabledIds = [...previousEnabled, modelId];
      }
    }

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        disabledAiModelIds: newDisabledIds,
        enabledAiModelIds: newEnabledIds,
      });

      await updateWorkspace({
        variables: {
          input: {
            disabledAiModelIds: newDisabledIds,
            enabledAiModelIds: newEnabledIds,
          },
        },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
        disabledAiModelIds: previousDisabled,
        enabledAiModelIds: previousEnabled,
      });

      enqueueErrorSnackBar({
        message: t`Failed to update model availability`,
      });
    }
  };

  const filteredModels = searchQuery.trim()
    ? allModelsWithAvailability.filter((model) => {
        const query = searchQuery.toLowerCase();

        return (
          model.label.toLowerCase().includes(query) ||
          (model.modelFamily?.toLowerCase().includes(query) ?? false) ||
          model.inferenceProvider.toLowerCase().includes(query)
        );
      })
    : allModelsWithAvailability;

  return (
    <>
      <Section>
        <H2Title
          title={t`Models`}
          description={t`Configure default AI models and availability`}
        />

        <Card rounded>
          <SettingsOptionCardContentSelect
            Icon={IconBolt}
            title={t`Smart Model`}
            description={t`Used for chats, agents, and complex reasoning`}
          >
            <Select
              dropdownId="smart-model-select"
              value={currentSmartModel}
              onChange={(value) => handleModelFieldChange('smartModel', value)}
              options={smartModelOptions}
              selectSizeVariant="small"
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentSelect
            Icon={IconBolt}
            title={t`Fast Model`}
            description={t`Used for lightweight tasks like title generation`}
          >
            <Select
              dropdownId="fast-model-select"
              value={currentFastModel}
              onChange={(value) => handleModelFieldChange('fastModel', value)}
              options={fastModelOptions}
              selectSizeVariant="small"
              dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentToggle
            Icon={IconTwentyStar}
            title={t`Use best models only`}
            description={t`Restrict available models to a curated list`}
            checked={useRecommendedModels}
            onChange={handleUseRecommendedToggle}
            divider={!useRecommendedModels}
          />
          {!useRecommendedModels && (
            <SettingsOptionCardContentToggle
              Icon={IconRobot}
              title={t`Automatically mark new models as available`}
              description={t`When enabled, new AI models will be available to users by default`}
              checked={autoEnableNewAiModels}
              onChange={handleAutoEnableToggle}
            />
          )}
        </Card>
      </Section>

      {!useRecommendedModels && (
        <Section>
          <H2Title
            title={t`Available`}
            description={t`Models available in the chat model picker`}
          />

          <StyledSearchContainer>
            <StyledSearchInput
              instanceId="model-table-search"
              LeftIcon={IconSearch}
              placeholder={t`Search a model...`}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </StyledSearchContainer>

          <Card rounded>
            {filteredModels.map((model, index) => (
              <SettingsOptionCardContentToggle
                key={model.modelId}
                Icon={getModelIcon(model.modelFamily)}
                title={model.label}
                description={getModelProviderLabel(model.modelFamily)}
                checked={model.isEnabled}
                onChange={() =>
                  handleModelToggle(model.modelId, model.isEnabled)
                }
                divider={index < filteredModels.length - 1}
              />
            ))}
          </Card>
        </Section>
      )}
    </>
  );
};
