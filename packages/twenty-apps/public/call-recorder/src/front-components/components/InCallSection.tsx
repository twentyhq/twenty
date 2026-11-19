import { useState } from 'react';
import { Section } from 'twenty-ui/components/layout';
import { Field, Textarea } from 'twenty-ui/primitives/input';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsOptionCardContentSwitch } from 'src/front-components/components/SettingsOptionCardContentSwitch';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { TimingCounterRow } from 'src/front-components/components/TimingCounterRow';
import {
  CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD,
  CALL_RECORDER_RECORDING_NOTICE_ROW,
  CALL_RECORDER_TIMING_ROWS,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { SETTINGS_TEXTAREA_ROWS } from 'src/front-components/constants/settings-textarea-rows.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { truncateRecordingNoticeMessage } from 'src/logic-functions/utils/truncate-recording-notice-message.util';

export const InCallSection = () => {
  const [isNoticeEnabled, setIsNoticeEnabled] = useState(
    () =>
      getApplicationVariableValue(
        CALL_RECORDER_RECORDING_NOTICE_ROW.variableKey,
      ) === 'true',
  );
  const [noticeMessageValue, setNoticeMessageValue] = useState(() =>
    getApplicationVariableValue(
      CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.variableKey,
    ),
  );

  const { saveImmediately: saveNoticeEnabledImmediately } =
    useAutosaveApplicationVariable({
      variableKey: CALL_RECORDER_RECORDING_NOTICE_ROW.variableKey,
    });
  const { saveDebounced: saveNoticeMessageDebounced } =
    useAutosaveApplicationVariable({
      variableKey: CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.variableKey,
    });

  const handleNoticeEnabledChange = (checked: boolean) => {
    const value = checked ? 'true' : 'false';

    setIsNoticeEnabled(checked);
    saveNoticeEnabledImmediately(value);
  };

  const handleNoticeMessageChange = (value: string) => {
    const truncatedValue = truncateRecordingNoticeMessage(value);

    setNoticeMessageValue(truncatedValue);
    saveNoticeMessageDebounced(truncatedValue);
  };

  return (
    <Section.Root>
      <Section.Header
        title="In the call"
        description="What the recorder does while it is in your meetings."
      />
      <StyledSettingsSectionStack>
        <Card.Root fullWidth>
          {CALL_RECORDER_TIMING_ROWS.map((row) => (
            <TimingCounterRow
              key={row.variableKey}
              variableKey={row.variableKey}
              title={row.title}
              description={row.description}
              Icon={row.Icon}
              divider
              persistedValue={getApplicationVariableValue(row.variableKey)}
            />
          ))}
          <SettingsOptionCardContentSwitch
            Icon={CALL_RECORDER_RECORDING_NOTICE_ROW.Icon}
            title={CALL_RECORDER_RECORDING_NOTICE_ROW.title}
            description={CALL_RECORDER_RECORDING_NOTICE_ROW.description}
            checked={isNoticeEnabled}
            onChange={handleNoticeEnabledChange}
          />
        </Card.Root>
        <Field.Root disabled={!isNoticeEnabled}>
          <Field.Label>
            {CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.label}
          </Field.Label>
          <Textarea
            autoResize
            rows={SETTINGS_TEXTAREA_ROWS}
            placeholder="Value"
            value={noticeMessageValue}
            onValueChange={handleNoticeMessageChange}
            onBlur={() => saveNoticeMessageDebounced.flush()}
          />
          <Field.Description>
            {CALL_RECORDER_RECORDING_NOTICE_MESSAGE_FIELD.hint}
          </Field.Description>
        </Field.Root>
      </StyledSettingsSectionStack>
    </Section.Root>
  );
};
