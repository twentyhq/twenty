import { useAgentModelCapabilities } from '@/ai/hooks/useAgentModelCapabilities';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { t } from '@lingui/core/macro';
import { type ModelConfiguration } from 'twenty-shared/ai';
import { Section } from 'twenty-ui/components/layout';
import { SettingsRow } from 'twenty-ui/components/settings';

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
  const { capabilities, toggleCapability } = useAgentModelCapabilities({
    selectedModelId,
    modelConfiguration,
    onConfigurationChange,
    disabled,
  });

  if (capabilities.length === 0) {
    return null;
  }

  return (
    <Section.Root>
      <InputLabel>{t`Enable model-specific features`}</InputLabel>
      <div>
        {capabilities.map((capability) => (
          <SettingsRow
            key={capability.key}
            startElement={<capability.Icon />}
            checked={capability.enabled}
            onCheckedChange={(isChecked) =>
              toggleCapability({
                capability: capability.key,
                enabled: isChecked,
              })
            }
            disabled={disabled}
          >
            {capability.label}
          </SettingsRow>
        ))}
      </div>
    </Section.Root>
  );
};
