import { useId } from 'react';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';

import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { SettingsOptionCardContentSelect } from 'src/front-components/components/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledDimmable } from 'src/front-components/components/StyledDimmable';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextArea } from 'src/front-components/components/StyledSettingsTextArea';
import { TranscriptProviderControl } from 'src/front-components/components/TranscriptProviderControl';
import {
  CALL_RECORDER_SUMMARY_ENABLED_ROW,
  CALL_RECORDER_SUMMARY_PROMPT_FIELD,
  CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import {
  type ApplicationVariableDraftByKey,
  type UpdateApplicationVariableDraft,
} from 'src/front-components/types/application-variable-draft.type';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { serializeRichTextMarkdown } from 'src/front-components/utils/serialize-rich-text-markdown.util';
import { extractRichTextMarkdown } from 'src/logic-functions/utils/extract-rich-text-markdown.util';

type TranscriptionSectionProps = {
  applicationVariables: Pick<
    CallRecorderApplicationVariable,
    'key' | 'value' | 'options'
  >[];
  draftValueByVariableKey: ApplicationVariableDraftByKey;
  onDraftValueChange: UpdateApplicationVariableDraft;
};

export const TranscriptionSection = ({
  applicationVariables,
  draftValueByVariableKey,
  onDraftValueChange,
}: TranscriptionSectionProps) => {
  const inputId = useId();
  const providerDraftValue =
    draftValueByVariableKey[CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey];
  const providerValue =
    providerDraftValue?.inputValue ??
    getApplicationVariableValue({
      applicationVariables,
      variableKey: CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
    });
  const summaryEnabledDraftValue =
    draftValueByVariableKey[CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey];
  const isSummaryEnabled =
    (summaryEnabledDraftValue?.inputValue ??
      getApplicationVariableValue({
        applicationVariables,
        variableKey: CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey,
      })) === 'true';
  const promptDraftValue =
    draftValueByVariableKey[CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey];
  const promptMarkdown =
    promptDraftValue?.inputValue ??
    extractRichTextMarkdown(
      getApplicationVariableValue({
        applicationVariables,
        variableKey: CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey,
      }),
    ) ??
    '';

  const providerOptions =
    applicationVariables.find(
      (variable) =>
        variable.key === CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
    )?.options ?? [];

  const handleProviderChange = (value: string) => {
    onDraftValueChange({
      variableKey: CALL_RECORDER_TRANSCRIPT_PROVIDER_ROW.variableKey,
      inputValue: value,
      valueToSave: value,
    });
  };

  const handleSummaryEnabledChange = (checked: boolean) => {
    const value = checked ? 'true' : 'false';

    onDraftValueChange({
      variableKey: CALL_RECORDER_SUMMARY_ENABLED_ROW.variableKey,
      inputValue: value,
      valueToSave: value,
    });
  };

  const handlePromptChange = (value: string) => {
    onDraftValueChange({
      variableKey: CALL_RECORDER_SUMMARY_PROMPT_FIELD.variableKey,
      inputValue: value,
      valueToSave: serializeRichTextMarkdown(value),
    });
  };

  return (
    <Section>
      <H2Title
        title="Transcription"
        description="What happens to a recording once the call ends."
      />
      <StyledSettingsSectionStack>
        <Card rounded fullWidth>
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
        </Card>
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
            />
          </LabelledSettingsField>
        </StyledDimmable>
      </StyledSettingsSectionStack>
    </Section>
  );
};
