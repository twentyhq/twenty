import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { SettingsAiAssistantChoiceContent } from '~/pages/settings/ai/components/SettingsAiAssistantChoiceContent';
import { SettingsAiAssistantCustomize } from '~/pages/settings/ai/components/SettingsAiAssistantCustomize';
import { SETTINGS_AI_ASSISTANT_COLOR_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantColorLabels';
import { SETTINGS_AI_ASSISTANT_PRESETS } from '~/pages/settings/ai/constants/SettingsAiAssistantPresets';
import { SETTINGS_AI_ASSISTANT_SHAPE_LABELS } from '~/pages/settings/ai/constants/SettingsAiAssistantShapeLabels';
import { type SettingsAiAssistantSectionProps } from '~/pages/settings/ai/types/SettingsAiAssistantSectionProps';
import { getSettingsAiAssistantPreset } from '@/settings/ai/utils/getSettingsAiAssistantPreset';

export const SettingsAiAssistantSection = ({
  value,
  onChange,
  disabled = false,
  isSaving = false,
  errorMessage,
}: SettingsAiAssistantSectionProps) => {
  const { t } = useLingui();
  const sectionId = useId();
  const errorId = `${sectionId}-error`;
  const hasError = isNonEmptyString(errorMessage);
  const selectedPreset = getSettingsAiAssistantPreset({
    value,
    presets: SETTINGS_AI_ASSISTANT_PRESETS,
  });
  const isDisabled = disabled || isSaving;

  return (
    <Section.Root aria-busy={isSaving}>
      <Section.Header
        title={t`Avatar`}
        description={t`Pick a starting point, then make it yours`}
      />
      <RadioGroup
        layout="grid"
        aria-label={t`Assistant avatar`}
        aria-busy={isSaving}
        aria-describedby={hasError ? errorId : undefined}
        value={selectedPreset?.displayName ?? null}
        disabled={isDisabled}
        onValueChange={(displayName) => {
          const preset = SETTINGS_AI_ASSISTANT_PRESETS.find(
            (profile) => profile.displayName === displayName,
          );

          if (isDefined(preset)) {
            onChange(preset);
          }
        }}
      >
        {SETTINGS_AI_ASSISTANT_PRESETS.map((preset) => (
          <Radio
            key={preset.displayName}
            value={preset.displayName}
            aria-label={preset.displayName}
            variant="card"
          >
            <SettingsAiAssistantChoiceContent
              value={preset}
              title={preset.displayName}
              description={t`${t(SETTINGS_AI_ASSISTANT_SHAPE_LABELS[preset.avatarShape])} · ${t(SETTINGS_AI_ASSISTANT_COLOR_LABELS[preset.avatarColor])}`}
            />
          </Radio>
        ))}
        <SettingsAiAssistantCustomize
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          isCustom={!isDefined(selectedPreset)}
          describedBy={hasError ? errorId : undefined}
        />
      </RadioGroup>
      <VisuallyHidden role="status">
        {isSaving ? t`Saving assistant settings...` : ''}
      </VisuallyHidden>
      {hasError && (
        <InlineBanner
          id={errorId}
          role="alert"
          status="error"
          icon={<IconAlertTriangle aria-hidden />}
          embedded
        >
          {errorMessage}
        </InlineBanner>
      )}
    </Section.Root>
  );
};
