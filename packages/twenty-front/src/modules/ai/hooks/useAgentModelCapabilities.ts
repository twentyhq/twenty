import { useLingui } from '@lingui/react/macro';
import { IconBrandX, IconWorld } from 'twenty-ui/icon';

import { useResolvedAiModel } from '@/ai/hooks/useResolvedAiModel';
import { type AgentModelConfiguration } from '@/ai/types/AgentModelConfiguration';

export const useAgentModelCapabilities = ({
  selectedModelId,
  modelConfiguration,
  onConfigurationChange,
  disabled = false,
}: {
  selectedModelId: string;
  modelConfiguration: AgentModelConfiguration;
  onConfigurationChange: (configuration: AgentModelConfiguration) => void;
  disabled?: boolean;
}) => {
  const { t } = useLingui();
  const selectedModel = useResolvedAiModel(selectedModelId);
  const nativeCapabilities = selectedModel?.nativeCapabilities;

  const capabilities = [
    ...(nativeCapabilities?.webSearch === true
      ? [
          {
            key: 'webSearch' as const,
            label: t`Web Search`,
            Icon: IconWorld,
            enabled: modelConfiguration.webSearch?.enabled || false,
          },
        ]
      : []),
    ...(nativeCapabilities?.twitterSearch === true
      ? [
          {
            key: 'twitterSearch' as const,
            label: t`Twitter/X Search`,
            Icon: IconBrandX,
            enabled: modelConfiguration.twitterSearch?.enabled || false,
          },
        ]
      : []),
  ];

  const toggleCapability = (
    capability: 'webSearch' | 'twitterSearch',
    enabled: boolean,
  ) => {
    if (disabled) {
      return;
    }

    onConfigurationChange({
      ...modelConfiguration,
      [capability]: {
        enabled,
        configuration: modelConfiguration[capability]?.configuration || {},
      },
    });
  };

  return { capabilities, toggleCapability };
};
