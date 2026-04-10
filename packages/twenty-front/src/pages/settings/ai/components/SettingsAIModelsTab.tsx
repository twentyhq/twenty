import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  AUTO_SELECT_FAST_MODEL_ID,
  AUTO_SELECT_SMART_MODEL_ID,
} from 'twenty-shared/constants';

import { useWorkspaceAiModelAvailability } from '@/ai/hooks/useWorkspaceAiModelAvailability';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { SettingsAiModelsTable } from '@/settings/ai/components/SettingsAiModelsTable';
import { getDataResidencyDisplay } from '@/settings/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { H2Title, IconBolt, IconBrain, IconStar } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

const StyledCustomModelsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding-top: ${themeCssVariables.spacing[4]};
`;

export const SettingsAIModelsTab = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);
  const [searchQuery, setSearchQuery] = useState('');
  const aiModels = useAtomStateValue(aiModelsState);

  const { enabledModels, useRecommendedModels, realModels } =
    useWorkspaceAiModelAvailability();

  const enabledModelIdSet = new Set(currentWorkspace?.enabledAiModelIds ?? []);

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
    ? realModels.filter((model) => {
        const query = searchQuery.toLowerCase();

        return (
          model.label.toLowerCase().includes(query) ||
          (model.modelFamily?.toLowerCase().includes(query) ?? false) ||
          (model.sdkPackage?.toLowerCase().includes(query) ?? false)
        );
      })
    : realModels;

  return (
    <>
      <Section>
        <H2Title
          title={t`Default`}
          description={t`Configure your default AI model`}
        />

        <Card rounded>
          <SettingsOptionCardContentSelect
            Icon={IconBrain}
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
        </Card>
      </Section>

      <Section>
        <H2Title
          title={t`Available`}
          description={t`Models available in the chat model picker`}
        />
        <Card rounded>
          <SettingsOptionCardContentToggle
            Icon={IconStar}
            title={t`Use best models only`}
            description={t`Restrict available models to a curated list`}
            checked={useRecommendedModels}
            onChange={handleUseRecommendedToggle}
            divider={!useRecommendedModels}
          />
        </Card>

        {!useRecommendedModels && (
          <StyledCustomModelsContainer>
            <SearchInput
              placeholder={t`Search a model...`}
              value={searchQuery}
              onChange={setSearchQuery}
            />

            <SettingsAiModelsTable
              models={filteredModels}
              isChecked={(model) => enabledModelIdSet.has(model.modelId)}
              onToggle={handleModelToggle}
              onToggleAll={async (shouldCheckAll) => {
                const previousIds = currentWorkspace?.enabledAiModelIds ?? [];
                const visibleModelIds = new Set(
                  filteredModels.map((m) => m.modelId),
                );

                const newEnabledIds = shouldCheckAll
                  ? [...new Set([...previousIds, ...visibleModelIds])]
                  : previousIds.filter((id) => !visibleModelIds.has(id));

                try {
                  setCurrentWorkspace({
                    ...currentWorkspace!,
                    enabledAiModelIds: newEnabledIds,
                  });
                  await updateWorkspace({
                    variables: { input: { enabledAiModelIds: newEnabledIds } },
                  });
                } catch {
                  setCurrentWorkspace({
                    ...currentWorkspace!,
                    enabledAiModelIds: previousIds,
                  });
                  enqueueErrorSnackBar({
                    message: t`Failed to update model availability`,
                  });
                }
              }}
              anchorPrefix="workspace-model-row"
            />
          </StyledCustomModelsContainer>
        )}
      </Section>
    </>
  );
};
