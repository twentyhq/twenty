import { useLingui } from '@lingui/react/macro';
import {
  type ModelConfiguration,
  parseAiModelVariantId,
} from 'twenty-shared/ai';
import { IconBrandX, IconWorld } from 'twenty-ui/icon';

import { useResolvedAiModel } from '@/ai/hooks/useResolvedAiModel';

export const useAgentModelCapabilities = ({
  selectedModelId,
  modelConfiguration,
  onConfigurationChange,
  disabled = false,
}: {
  selectedModelId: string;
  modelConfiguration: ModelConfiguration;
  onConfigurationChange: (configuration: ModelConfiguration) => void;
  disabled?: boolean;
}) => {
  const { t } = useLingui();
  const { modelId: baseModelId } = parseAiModelVariantId(selectedModelId);
  const selectedModel = useResolvedAiModel(baseModelId);
  const nativeCapabilities = selectedModel?.nativeCapabilities;

  const capabilities = [
    ...(nativeCapabilities?.webSearch
      ? [
          {
            key: 'webSearch' as const,
            label: t`Web Search`,
            Icon: IconWorld,
            enabled: modelConfiguration.webSearch?.enabled ?? false,
          },
        ]
      : []),
    ...(nativeCapabilities?.twitterSearch
      ? [
          {
            key: 'twitterSearch' as const,
            label: t`Twitter/X Search`,
            Icon: IconBrandX,
            enabled: modelConfiguration.twitterSearch?.enabled ?? false,
          },
        ]
      : []),
  ];

  const toggleCapability = ({
    capability,
    enabled,
  }: {
    capability: 'webSearch' | 'twitterSearch';
    enabled: boolean;
  }) => {
    if (disabled) {
      return;
    }

    onConfigurationChange({
      ...modelConfiguration,
      [capability]: {
        ...modelConfiguration[capability],
        enabled,
      },
    });
  };

  return { capabilities, toggleCapability };
};
