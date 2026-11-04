import {
  type ModelConfiguration,
  parseAiModelVariantId,
} from 'twenty-shared/ai';
import { Section } from 'twenty-ui/components/layout';
import { SettingsRow } from 'twenty-ui/components/settings';
import { IconBrandX, IconWorld } from 'twenty-ui/icon';

import { useResolvedAiModel } from '@/ai/hooks/useResolvedAiModel';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { useLingui } from '@lingui/react/macro';

type SettingsAgentModelCapabilitiesProps = {
  selectedModelId: string;
  modelConfiguration: ModelConfiguration;
  onConfigurationChange: (configuration: ModelConfiguration) => void;
  disabled?: boolean;
};

export const SettingsAgentModelCapabilities = ({
  selectedModelId,
  modelConfiguration,
  onConfigurationChange,
  disabled = false,
}: SettingsAgentModelCapabilitiesProps) => {
  const { t } = useLingui();
  const { modelId: baseModelId } = parseAiModelVariantId(selectedModelId);
  const selectedModel = useResolvedAiModel(baseModelId);

  if (
    !selectedModel?.nativeCapabilities?.webSearch &&
    !selectedModel?.nativeCapabilities?.twitterSearch
  ) {
    return null;
  }

  const handleCapabilityChange = ({
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

  return (
    <Section.Root>
      <InputLabel>{t`Enable model-specific features`}</InputLabel>
      <div>
        {selectedModel.nativeCapabilities?.webSearch && (
          <SettingsRow
            startElement={<IconWorld />}
            checked={modelConfiguration.webSearch?.enabled ?? false}
            onCheckedChange={(enabled) =>
              handleCapabilityChange({ capability: 'webSearch', enabled })
            }
            disabled={disabled}
          >
            {t`Web Search`}
          </SettingsRow>
        )}
        {selectedModel.nativeCapabilities?.twitterSearch && (
          <SettingsRow
            startElement={<IconBrandX />}
            checked={modelConfiguration.twitterSearch?.enabled ?? false}
            onCheckedChange={(enabled) =>
              handleCapabilityChange({ capability: 'twitterSearch', enabled })
            }
            disabled={disabled}
          >
            {t`Twitter/X Search`}
          </SettingsRow>
        )}
      </div>
    </Section.Root>
  );
};
