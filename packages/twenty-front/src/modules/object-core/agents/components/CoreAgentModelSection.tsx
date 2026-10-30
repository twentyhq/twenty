import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { SettingsRow } from 'twenty-ui/components/settings';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AiModelPicker } from '@/ai/components/AiModelPicker';
import { useAgentModelCapabilities } from '@/ai/hooks/useAgentModelCapabilities';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { CoreAgentSectionCard } from '@/object-core/agents/components/CoreAgentSectionCard';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.sm};
`;

type CoreAgentModelSectionProps = {
  formValues: CoreAgentFormValues;
  onFieldChange: (
    field: keyof CoreAgentFormValues,
    value: CoreAgentFormValues[keyof CoreAgentFormValues],
  ) => void;
  isReadOnly: boolean;
};

export const CoreAgentModelSection = ({
  formValues,
  onFieldChange,
  isReadOnly,
}: CoreAgentModelSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const aiModels = useAtomStateValue(aiModelsState);
  const { capabilities, toggleCapability } = useAgentModelCapabilities({
    selectedModelId: formValues.modelId,
    modelConfiguration: formValues.modelConfiguration ?? {},
    onConfigurationChange: (configuration) =>
      onFieldChange('modelConfiguration', configuration),
    disabled: isReadOnly,
  });

  return (
    <Section.Root>
      <Section.Header
        title={t`Model`}
        description={t`What AI model should your agent run on`}
      />
      {aiModels.length === 0 ? (
        <StyledErrorMessage>
          {t`No AI provider is configured on this instance.`}
        </StyledErrorMessage>
      ) : (
        <CoreAgentSectionCard hasGap>
          <AiModelPicker
            modelId={formValues.modelId}
            onModelIdChange={(value) => onFieldChange('modelId', value)}
            disabled={isReadOnly}
          />
          {capabilities.map((capability) => (
            <SettingsRow
              key={capability.key}
              startElement={
                <ListItemIconContainer>
                  <capability.Icon
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                </ListItemIconContainer>
              }
              checked={capability.enabled}
              onCheckedChange={(isChecked) =>
                toggleCapability(capability.key, isChecked)
              }
              size="md"
              disabled={isReadOnly}
            >
              {capability.label}
            </SettingsRow>
          ))}
        </CoreAgentSectionCard>
      )}
    </Section.Root>
  );
};
