import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { aiModelsState } from '@/client-config/states/aiModelsState';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconBrandX, IconWorld } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledCheckboxContainer = styled.div<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: background-color
    ${({ theme }) => theme.animation.duration.normal}s ease;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    background-color: ${({ theme, disabled }) =>
      disabled ? 'transparent' : theme.background.transparent.light};
  }
`;

const StyledCheckboxLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
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
  const theme = useTheme();
  const aiModels = useRecoilValue(aiModelsState);

  const selectedModel = aiModels.find((m) => m.modelId === selectedModelId);
  const nativeCapabilities = selectedModel?.nativeCapabilities;

  if (!isDefined(nativeCapabilities)) {
    return null;
  }

  if (!nativeCapabilities.webSearch && !nativeCapabilities.twitterSearch) {
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
    ...(nativeCapabilities.webSearch
      ? [
          {
            key: 'webSearch' as const,
            label: t`Web Search`,
            Icon: IconWorld,
            enabled: modelConfiguration.webSearch?.enabled || false,
          },
        ]
      : []),
    ...(nativeCapabilities.twitterSearch
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
              checked={capability.enabled}
              onChange={(event) => {
                event.stopPropagation();
                handleCapabilityToggle(capability.key, event.target.checked);
              }}
              disabled={disabled}
            />
          </StyledCheckboxContainer>
        ))}
      </div>
    </Section>
  );
};
