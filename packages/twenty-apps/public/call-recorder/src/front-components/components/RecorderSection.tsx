import { useId, useState } from 'react';
import { Section } from 'twenty-ui/components/layout';

import { CameraTileStylePicker } from 'src/front-components/components/CameraTileStylePicker';
import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import {
  CALL_RECORDER_NAME_FIELD,
  CALL_RECORDER_STYLE_DESCRIPTIONS,
  CALL_RECORDER_STYLE_FIELD,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { DEFAULT_CALL_RECORDER_STYLE } from 'src/logic-functions/constants/default-call-recorder-style';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';
import { isCallRecorderStyle } from 'src/logic-functions/utils/is-call-recorder-style.util';

const getInitialStyle = (): CallRecorderStyle => {
  const value = getApplicationVariableValue(
    CALL_RECORDER_STYLE_FIELD.variableKey,
  ).trim();

  return isCallRecorderStyle(value) ? value : DEFAULT_CALL_RECORDER_STYLE;
};

export const RecorderSection = () => {
  const nameInputId = useId();
  const styleLabelId = useId();
  const [nameValue, setNameValue] = useState(() =>
    getApplicationVariableValue(CALL_RECORDER_NAME_FIELD.variableKey),
  );
  const [style, setStyle] = useState(getInitialStyle);

  const { saveDebounced: saveNameDebounced } = useAutosaveApplicationVariable({
    variableKey: CALL_RECORDER_NAME_FIELD.variableKey,
  });
  const { saveImmediately: saveStyleImmediately } =
    useAutosaveApplicationVariable({
      variableKey: CALL_RECORDER_STYLE_FIELD.variableKey,
    });

  const handleNameChange = (value: string) => {
    setNameValue(value);
    saveNameDebounced(value);
  };

  const handleStyleChange = (value: CallRecorderStyle) => {
    if (value === style) {
      return;
    }

    setStyle(value);
    saveStyleImmediately(value);
  };

  return (
    <Section.Root>
      <Section.Header
        title="Recorder"
        description="How the recorder appears when it joins your meetings."
      />
      <StyledSettingsSectionStack>
        <LabelledSettingsField
          label={CALL_RECORDER_NAME_FIELD.label}
          inputId={nameInputId}
          hint={CALL_RECORDER_NAME_FIELD.hint}
        >
          <StyledSettingsTextInput
            id={nameInputId}
            type="text"
            autoComplete="off"
            placeholder="Value"
            value={nameValue}
            onChange={(event) => handleNameChange(event.target.value)}
            onBlur={() => saveNameDebounced.flush()}
          />
        </LabelledSettingsField>
        <LabelledSettingsField
          label={CALL_RECORDER_STYLE_FIELD.label}
          labelId={styleLabelId}
          hint={`${CALL_RECORDER_STYLE_DESCRIPTIONS[style]} ${CALL_RECORDER_STYLE_FIELD.hint}`}
        >
          <CameraTileStylePicker
            labelId={styleLabelId}
            value={style}
            onChange={handleStyleChange}
          />
        </LabelledSettingsField>
      </StyledSettingsSectionStack>
    </Section.Root>
  );
};
