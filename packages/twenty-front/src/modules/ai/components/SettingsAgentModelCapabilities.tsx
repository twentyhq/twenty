import { useResolvedAiModel } from '@/ai/hooks/useResolvedAiModel';
import { InputLabel, Checkbox } from 'twenty-ui/input';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconBrandX, IconWorld } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCheckboxContainer = styled.div<{ disabled: boolean }>`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  height: ${themeCssVariables.spacing[8]};
  justify-content: space-between;
  padding-inline: ${themeCssVariables.spacing[2]};
  transition: background-color
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;

  &:hover {
    background-color: ${({ disabled }) =>
      disabled
        ? 'transparent'
        : themeCssVariables.background.transparent.light};
  }
`;

const StyledCheckboxLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type ModelConfiguration = {
  webSearch?: {
    enabled: boolean;
    configuration?: Record<string, unknown>;
  };
  twitterSearch?: {
    enabled: boolean;
    configuration?: Record<string, unknown>;
  };
};

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
  const { theme } = useContext(ThemeContext);
  const selectedModel = useResolvedAiModel(selectedModelId);
  const nativeCapabilities = selectedModel?.nativeCapabilities;

  if (!isDefined(nativeCapabilities)) {
    return null;
  }

  const showNativeWebSearch = nativeCapabilities.webSearch;
  const showNativeTwitterSearch = nativeCapabilities.twitterSearch;

  if (!showNativeWebSearch && !showNativeTwitterSearch) {
    return null;
  }

  const handleCapabilityToggle = (
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

  const capabilities = [
    ...(showNativeWebSearch
      ? [
          {
            key: 'webSearch' as const,
            label: t`Web Search`,
            Icon: IconWorld,
            enabled: modelConfiguration.webSearch?.enabled || false,
          },
        ]
      : []),
    ...(showNativeTwitterSearch
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

  return (
    <Section>
      <InputLabel>{t`Enable model-specific features`}</InputLabel>
      <div>
        {capabilities.map((capability) => (
          <StyledCheckboxContainer
            disabled={disabled}
            key={capability.key}
            onClick={() =>
              handleCapabilityToggle(capability.key, !capability.enabled)
            }
          >
            <StyledCheckboxLabel>
              <capability.Icon size={theme.icon.size.sm} />
              <span>{capability.label}</span>
            </StyledCheckboxLabel>
            <Checkbox
              aria-label={capability.label}
              checked={capability.enabled}
              onCheckedChange={(isChecked) => {
                handleCapabilityToggle(capability.key, isChecked);
              }}
              disabled={disabled}
              onClick={(event) => event.stopPropagation()}
            />
          </StyledCheckboxContainer>
        ))}
      </div>
    </Section>
  );
};
