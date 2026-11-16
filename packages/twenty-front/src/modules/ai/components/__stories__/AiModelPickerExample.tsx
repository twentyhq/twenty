import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { Text } from 'twenty-ui/primitives/typography';

import { AiModelPicker } from '@/ai/components/AiModelPicker';
import { SettingsAgentModelCapabilities } from '@/ai/components/SettingsAgentModelCapabilities';
import { MODEL_STORY_MODELS } from '@/ai/components/__stories__/modelStoryModels';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelTiersState } from '@/client-config/states/aiModelTiersState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { AiModelTier } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

type AiModelPickerExampleProps = {
  initialModelId?: string;
  initialModelConfiguration?: ModelConfiguration;
  disabled?: boolean;
  shouldShowCapabilities?: boolean;
  onModelIdChange: (modelId: string) => void;
  onConfigurationChange: (configuration: ModelConfiguration) => void;
};

export const AiModelPickerExample = ({
  initialModelId = AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  initialModelConfiguration = {},
  disabled = false,
  shouldShowCapabilities = false,
  onModelIdChange,
  onConfigurationChange,
}: AiModelPickerExampleProps) => {
  const [modelId, setModelId] = useState(initialModelId);
  const [modelConfiguration, setModelConfiguration] = useState(
    initialModelConfiguration,
  );
  const [store] = useState(() => {
    const previewStore = createStore();

    previewStore.set(aiModelsState.atom, MODEL_STORY_MODELS);
    previewStore.set(
      aiModelTiersState.atom,
      Object.values(AiModelTier).map((tier) => ({
        tier,
        modelId: 'story/reasoning-one',
        requiredDataResidencyRegion: null,
        isZeroDataRetentionRequired: false,
      })),
    );
    previewStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      aiAgentModelTier: AiModelTier.balanced,
      isAutoModelSelectionEnabled: true,
    });

    return previewStore;
  });

  const handleModelIdChange = (nextModelId: string) => {
    setModelId(nextModelId);
    onModelIdChange(nextModelId);
  };

  const handleConfigurationChange = (configuration: ModelConfiguration) => {
    setModelConfiguration(configuration);
    onConfigurationChange(configuration);
  };

  return (
    <Provider store={store}>
      <AiModelPicker
        modelId={modelId}
        onModelIdChange={handleModelIdChange}
        disabled={disabled}
      />
      {shouldShowCapabilities && (
        <SettingsAgentModelCapabilities
          selectedModelId={modelId}
          modelConfiguration={modelConfiguration}
          onConfigurationChange={handleConfigurationChange}
          disabled={disabled}
        />
      )}
      <Text color="tertiary" size="sm">
        Selected model: {modelId}
      </Text>
    </Provider>
  );
};
