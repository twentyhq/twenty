import { useId, useState } from 'react';
import { Section } from 'twenty-ui/components/layout';
import { Field, Input } from 'twenty-ui/primitives/input';

import { CameraTileStylePicker } from 'src/front-components/components/CameraTileStylePicker';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
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
        <Field.Root>
          <Field.Label>{CALL_RECORDER_NAME_FIELD.label}</Field.Label>
          <Input
            autoComplete="off"
            placeholder="Value"
            value={nameValue}
            onValueChange={handleNameChange}
            onBlur={() => saveNameDebounced.flush()}
          />
          <Field.Description>{CALL_RECORDER_NAME_FIELD.hint}</Field.Description>
        </Field.Root>
        <Field.Root>
          <Field.Label id={styleLabelId}>
            {CALL_RECORDER_STYLE_FIELD.label}
          </Field.Label>
          <CameraTileStylePicker
            labelId={styleLabelId}
            value={style}
            onChange={handleStyleChange}
          />
          <Field.Description>
            {`${CALL_RECORDER_STYLE_DESCRIPTIONS[style]} ${CALL_RECORDER_STYLE_FIELD.hint}`}
          </Field.Description>
        </Field.Root>
      </StyledSettingsSectionStack>
    </Section.Root>
  );
};
