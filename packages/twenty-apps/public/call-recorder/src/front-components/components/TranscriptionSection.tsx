import { useId, useState } from 'react';
import { Section } from 'twenty-ui/components/layout';
import { Field, Textarea } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { CALL_RECORDER_TRANSCRIPT_PROVIDER_OPTIONS } from 'src/constants/call-recorder-transcript-provider-options';
import { SettingsOptionCardContentSelect } from 'src/front-components/components/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentSwitch } from 'src/front-components/components/SettingsOptionCardContentSwitch';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { TranscriptProviderControl } from 'src/front-components/components/TranscriptProviderControl';
import {
  CALL_RECORDER_SUMMARY_ENABLED_ROW,
  CALL_RECORDER_SUMMARY_PROMPT_FIELD,
  CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { SETTINGS_TEXTAREA_ROWS } from 'src/front-components/constants/settings-textarea-rows.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { serializeRichTextMarkdown } from 'src/front-components/utils/serialize-rich-text-markdown.util';
import { extractRichTextMarkdown } from 'src/logic-functions/utils/extract-rich-text-markdown.util';

export const TranscriptionSection = () => {
  const providerTitleId = useId();
  const [providerValue, setProviderValue] = useState(() =>
    getApplicationVariableValue(
      CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
    ),
  );
  const [isSummaryEnabled, setIsSummaryEnabled] = useState(
    () =>
      getApplicationVariableValue(
        CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey,
      ) === 'true',
  );
  const [promptMarkdown, setPromptMarkdown] = useState(
    () =>
      extractRichTextMarkdown(
        getApplicationVariableValue(
          CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey,
        ),
      ) ?? '',
  );

  const { saveImmediately: saveProviderImmediately } =
    useAutosaveApplicationVariable({
      variableKey: CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
    });
  const { saveImmediately: saveSummaryEnabledImmediately } =
    useAutosaveApplicationVariable({
      variableKey: CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey,
    });
  const { saveDebounced: savePromptDebounced } = useAutosaveApplicationVariable(
    {
      variableKey: CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey,
    },
  );

  const handleProviderChange = (value: string) => {
    setProviderValue(value);
    saveProviderImmediately(value);
  };

  const handleSummaryEnabledChange = (checked: boolean) => {
    const value = checked ? 'true' : 'false';

    setIsSummaryEnabled(checked);
    saveSummaryEnabledImmediately(value);
  };

  const handlePromptChange = (value: string) => {
    setPromptMarkdown(value);
    savePromptDebounced(serializeRichTextMarkdown(value));
  };

  return (
    <Section.Root>
      <Section.Header
        title="Transcription"
        description="What happens to a recording once the call ends."
      />
      <StyledSettingsSectionStack>
        <Card.Root fullWidth>
          <SettingsOptionCardContentSelect
            Icon={CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.Icon}
            title={CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.title}
            titleId={providerTitleId}
            description={CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.description}
            divider
          >
            <TranscriptProviderControl
              value={providerValue}
              options={CALL_RECORDER_TRANSCRIPT_PROVIDER_OPTIONS}
              labelledBy={providerTitleId}
              onChange={handleProviderChange}
            />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentSwitch
            Icon={CALL_RECORDER_SUMMARY_ENABLED_ROW.Icon}
            title={CALL_RECORDER_SUMMARY_ENABLED_ROW.title}
            description={CALL_RECORDER_SUMMARY_ENABLED_ROW.description}
            checked={isSummaryEnabled}
            onChange={handleSummaryEnabledChange}
          />
        </Card.Root>
        <Field.Root disabled={!isSummaryEnabled}>
          <Field.Label>{CALL_RECORDER_SUMMARY_PROMPT_FIELD.label}</Field.Label>
          <Textarea
            autoResize
            rows={SETTINGS_TEXTAREA_ROWS}
            placeholder="Value"
            value={promptMarkdown}
            onValueChange={handlePromptChange}
            onBlur={() => savePromptDebounced.flush()}
          />
          <Field.Description>
            {CALL_RECORDER_SUMMARY_PROMPT_FIELD.hint}
          </Field.Description>
        </Field.Root>
      </StyledSettingsSectionStack>
    </Section.Root>
  );
};
