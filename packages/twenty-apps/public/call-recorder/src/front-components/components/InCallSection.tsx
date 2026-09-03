import { useId, useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { SettingsOptionCardContentToggle } from 'src/front-components/components/SettingsOptionCardContentToggle';
import { StyledDimmable } from 'src/front-components/components/StyledDimmable';
import { StyledSettingsCard } from 'src/front-components/components/StyledSettingsCard';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextArea } from 'src/front-components/components/StyledSettingsTextArea';
import { TimingCounterRow } from 'src/front-components/components/TimingCounterRow';
import {
  CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD,
  CALL_RECORDER_RECORDING_NOTICE_ROW,
  CALL_RECORDER_TIMING_ROWS,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';

type InCallSectionProps = {
  applicationId: string | undefined;
  applicationVariables: Pick<
    CallRecorderApplicationVariable,
    'key' | 'value'
  >[];
};

export const InCallSection = ({
  applicationId,
  applicationVariables,
}: InCallSectionProps) => {
  const noticeMessageInputId = useId();
  const [isNoticeEnabled, setIsNoticeEnabled] = useState(
    () =>
      getApplicationVariableValue({
        applicationVariables,
        variableKey: CALL_RECORDER_RECORDING_NOTICE_ROW.variableKey,
      }) === 'true',
  );
  const [noticeMessageValue, setNoticeMessageValue] = useState(() =>
    getApplicationVariableValue({
      applicationVariables,
      variableKey: CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.variableKey,
    }),
  );

  const { saveImmediately: saveNoticeEnabledImmediately } =
    useAutosaveApplicationVariable({
      applicationId,
      variableKey: CALL_RECORDER_RECORDING_NOTICE_ROW.variableKey,
    });
  const { saveDebounced: saveNoticeMessageDebounced } =
    useAutosaveApplicationVariable({
      applicationId,
      variableKey: CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.variableKey,
    });

  const handleNoticeEnabledChange = (checked: boolean) => {
    const value = checked ? 'true' : 'false';

    setIsNoticeEnabled(checked);
    saveNoticeEnabledImmediately(value);
  };

  const handleNoticeMessageChange = (value: string) => {
    setNoticeMessageValue(value);
    saveNoticeMessageDebounced(value);
  };

  return (
    <Section>
      <H2Title
        title="In the call"
        description="What the recorder does while it is in your meetings."
      />
      <StyledSettingsSectionStack>
        <StyledSettingsCard>
          {CALL_RECORDER_TIMING_ROWS.map((row) => (
            <TimingCounterRow
              key={row.variableKey}
              applicationId={applicationId}
              variableKey={row.variableKey}
              title={row.title}
              description={row.description}
              Icon={row.Icon}
              divider
              persistedValue={getApplicationVariableValue({
                applicationVariables,
                variableKey: row.variableKey,
              })}
            />
          ))}
          <SettingsOptionCardContentToggle
            Icon={CALL_RECORDER_RECORDING_NOTICE_ROW.Icon}
            title={CALL_RECORDER_RECORDING_NOTICE_ROW.title}
            description={CALL_RECORDER_RECORDING_NOTICE_ROW.description}
            checked={isNoticeEnabled}
            onChange={handleNoticeEnabledChange}
          />
        </StyledSettingsCard>
        <StyledDimmable $dimmed={!isNoticeEnabled}>
          <LabelledSettingsField
            label={CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.label}
            inputId={noticeMessageInputId}
            hint={CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.hint}
          >
            <StyledSettingsTextArea
              id={noticeMessageInputId}
              placeholder="Value"
              maxLength={CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.maxLength}
              value={noticeMessageValue}
              onChange={(event) =>
                handleNoticeMessageChange(event.target.value)
              }
              onBlur={() => saveNoticeMessageDebounced.flush()}
            />
          </LabelledSettingsField>
        </StyledDimmable>
      </StyledSettingsSectionStack>
    </Section>
  );
};
