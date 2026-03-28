import { useState } from 'react';
import { styled } from '@linaria/react';

import {
  AUTO_SELECT_FAST_MODEL_ID,
  AUTO_SELECT_SMART_MODEL_ID,
} from 'twenty-shared/constants';

import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { H2Title, IconBolt, IconTwentyStar } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMutation } from '@apollo/client/react';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { getDataResidencyDisplay } from '@/settings/admin-panel/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/settings/admin-panel/ai/utils/getModelIcon';

const StyledSearchContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAIModelsTab = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const [searchQuery, setSearchQuery] = useState('');
  const aiModels = useAtomStateValue(aiModelsState);

  const {
    allModelsWithAvailability,
    enabledModels,
    useRecommendedModels,
    realModels,
  } = useWorkspaceAiModelAvailability();

  const currentSmartModel = currentWorkspace?.smartModel;
  const currentFastModel = currentWorkspace?.fastModel;

  const buildPinnedOption = (autoSelectModelId: string) => {
    const autoSelectEntry = aiModels.find(
      (model) => model.modelId === autoSelectModelId,
    );

    if (!autoSelectEntry) {
      return undefined;
    }

    return {
      value: autoSelectModelId,
      label: autoSelectEntry.label,
      Icon: getModelIcon(
        autoSelectEntry.modelFamily,
        autoSelectEntry.providerName,
      ),
      contextualText: t`Best`,
    };
  };

  const smartPinnedOption = buildPinnedOption(AUTO_SELECT_SMART_MODEL_ID);
  const fastPinnedOption = buildPinnedOption(AUTO_SELECT_FAST_MODEL_ID);

  const buildModelOptions = () =>
    enabledModels.map((model) => {
      const residencyFlag = model.dataResidency
        ? ` ${getDataResidencyDisplay(model.dataResidency)}`
        : '';

      return {
        value: model.modelId,
        label: `${model.label}${residencyFlag}`,
        Icon: getModelIcon(model.modelFamily, model.providerName),
      };
    });

  const smartModelOptions = buildModelOptions();
  const fastModelOptions = buildModelOptions();

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

  const handleModelToggle = async (
    modelId: string,
    isCurrentlyEnabled: boolean,
  ) => {
    if (!currentWorkspace?.id) {
      return;
    }

    const previousEnabled = currentWorkspace.enabledAiModelIds ?? [];

    const newEnabledIds = isCurrentlyEnabled
      ? previousEnabled.filter((id) => id !== modelId)
      : [...previousEnabled, modelId];

    try {
      setCurrentWorkspace({
        ...currentWorkspace,
        enabledAiModelIds: newEnabledIds,
      });

      await updateWorkspace({
        variables: {
          input: {
            enabledAiModelIds: newEnabledIds,
          },
        },
      });
    } catch {
      setCurrentWorkspace({
        ...currentWorkspace,
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
          (model.sdkPackage?.toLowerCase().includes(query) ?? false)
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
              pinnedOption={smartPinnedOption}
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
              pinnedOption={fastPinnedOption}
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
        </Card>
      </Section>

      {!useRecommendedModels && (
        <Section>
          <H2Title
            title={t`Available`}
            description={t`Models available in the chat model picker`}
          />

          <StyledSearchContainer>
            <SearchInput
              placeholder={t`Search a model...`}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </StyledSearchContainer>

          <Card rounded>
            {filteredModels.map((model, index) => {
              const familyLabel = model.modelFamilyLabel ?? '';
              const residency = model.dataResidency
                ? getDataResidencyDisplay(model.dataResidency)
                : undefined;
              const description = residency
                ? `${familyLabel} · ${residency}`
                : familyLabel;

              return (
                <SettingsOptionCardContentToggle
                  key={model.modelId}
                  Icon={getModelIcon(model.modelFamily, model.providerName)}
                  title={model.label}
                  description={description}
                  checked={model.isEnabled}
                  onChange={() =>
                    handleModelToggle(model.modelId, model.isEnabled)
                  }
                  divider={index < filteredModels.length - 1}
                />
              );
            })}
          </Card>
        </Section>
      )}
    </>
  );
};
