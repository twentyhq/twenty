import { useId, useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { SettingsOptionCardContentSelect } from 'src/front-components/components/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledDimmable } from 'src/front-components/components/StyledDimmable';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextArea } from 'src/front-components/components/StyledSettingsTextArea';
import { TranscriptProviderControl } from 'src/front-components/components/TranscriptProviderControl';
import {
  CALL_RECORDER_SUMMARY_ENABLED_ROW,
  CALL_RECORDER_SUMMARY_PROMPT_FIELD,
  CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { serializeRichTextMarkdown } from 'src/front-components/utils/serialize-rich-text-markdown.util';
import { extractRichTextMarkdown } from 'src/logic-functions/utils/extract-rich-text-markdown.util';

type TranscriptionSectionProps = {
  applicationId: string;
  applicationVariables: Pick<
    CallRecorderApplicationVariable,
    'key' | 'value' | 'options'
  >[];
};

export const TranscriptionSection = ({
  applicationId,
  applicationVariables,
}: TranscriptionSectionProps) => {
  const inputId = useId();
  const [providerValue, setProviderValue] = useState(() =>
    getApplicationVariableValue({
      applicationVariables,
      variableKey: CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
    }),
  );
  const [isSummaryEnabled, setIsSummaryEnabled] = useState(
    () =>
      getApplicationVariableValue({
        applicationVariables,
        variableKey: CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey,
      }) === 'true',
  );
  const [promptMarkdown, setPromptMarkdown] = useState(
    () =>
      extractRichTextMarkdown(
        getApplicationVariableValue({
          applicationVariables,
          variableKey: CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey,
        }),
      ) ?? '',
  );

  const { saveImmediately: saveProviderImmediately } =
    useAutosaveApplicationVariable({
      applicationId,
      variableKey: CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
    });
  const { saveImmediately: saveSummaryEnabledImmediately } =
    useAutosaveApplicationVariable({
      applicationId,
      variableKey: CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey,
    });
  const { saveDebounced: savePromptDebounced } = useAutosaveApplicationVariable(
    {
      applicationId,
      variableKey: CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey,
    },
  );

  const providerOptions =
    applicationVariables.find(
      (variable) =>
        variable.key === CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
    )?.options ?? [];

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
    <Section>
      <H2Title
        title="Transcription"
        description="What happens to a recording once the call ends."
      />
      <StyledSettingsSectionStack>
        <StyledSettingsCard>
          <SettingsOptionCardContentSelect
            Icon={CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.Icon}
            title={CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.title}
            description={CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.description}
            divider
          >
            <TranscriptProviderControl
              value={providerValue}
              options={providerOptions}
              onChange={handleProviderChange}
            />
          </SettingsOptionCardContentSelect>
          <SettingsOptionCardContentToggle
            Icon={CALL_RECORDER_SUMMARY_ENABLED_ROW.Icon}
            title={CALL_RECORDER_SUMMARY_ENABLED_ROW.title}
            description={CALL_RECORDER_SUMMARY_ENABLED_ROW.description}
            checked={isSummaryEnabled}
            onChange={handleSummaryEnabledChange}
          />
        </StyledSettingsCard>
        <StyledDimmable $dimmed={!isSummaryEnabled}>
          <LabelledSettingsField
            label={CALL_RECORDER_SUMMARY_PROMPT_FIELD.label}
            inputId={inputId}
            hint={CALL_RECORDER_SUMMARY_PROMPT_FIELD.hint}
          >
            <StyledSettingsTextArea
              id={inputId}
              placeholder="Value"
              value={promptMarkdown}
              onChange={(event) => handlePromptChange(event.target.value)}
              onBlur={() => savePromptDebounced.flush()}
            />
          </LabelledSettingsField>
        </StyledDimmable>
      </StyledSettingsSectionStack>
    </Section>
  );
};
