import { useId, useState } from 'react';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';

import { LabelledSettingsField } from 'src/front-components/components/LabelledSettingsField';
import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { StyledSettingsTextInput } from 'src/front-components/components/StyledSettingsTextInput';
import { TimingCounterRow } from 'src/front-components/components/TimingCounterRow';
import {
  CALL_RECORDER_NAME_FIELD,
  CALL_RECORDER_TIMING_ROWS,
} from 'src/front-components/constants/call-recorder-settings-layout.constant';
import { useDebouncedSaveApplicationVariable } from 'src/front-components/hooks/use-debounced-save-application-variable';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';

type InCallSectionProps = {
  applicationId: string;
  applicationVariables: Pick<
    CallRecorderApplicationVariable,
    'key' | 'value'
  >[];
};

export const InCallSection = ({
  applicationId,
  applicationVariables,
}: InCallSectionProps) => {
  const inputId = useId();
  const [nameValue, setNameValue] = useState(() =>
    getApplicationVariableValue({
      applicationVariables,
      variableKey: CALL_RECORDER_NAME_FIELD.variableKey,
    }),
  );
  const { saveDebounced } = useDebouncedSaveApplicationVariable({
    applicationId,
    variableKey: CALL_RECORDER_NAME_FIELD.variableKey,
  });

  const handleNameChange = (value: string) => {
    setNameValue(value);
    saveDebounced(value);
  };

  return (
    <Section>
      <H2Title
        title="In the call"
        description="How the recorder joins your meetings, and when it gives up or stops."
      />
      <StyledSettingsSectionStack>
        <LabelledSettingsField
          label={CALL_RECORDER_NAME_FIELD.label}
          inputId={inputId}
          hint={CALL_RECORDER_NAME_FIELD.hint}
        >
          <StyledSettingsTextInput
            id={inputId}
            type="text"
            autoComplete="off"
            placeholder="Value"
            value={nameValue}
            onChange={(event) => handleNameChange(event.target.value)}
            onBlur={() => saveDebounced.flush()}
          />
        </LabelledSettingsField>
        <Card rounded fullWidth>
          {CALL_RECORDER_TIMING_ROWS.map((row, rowIndex) => (
            <TimingCounterRow
              key={row.variableKey}
              applicationId={applicationId}
              variableKey={row.variableKey}
              title={row.title}
              description={row.description}
              Icon={row.Icon}
              divider={rowIndex < CALL_RECORDER_TIMING_ROWS.length - 1}
              initialValue={getApplicationVariableValue({
                applicationVariables,
                variableKey: row.variableKey,
              })}
            />
          ))}
        </Card>
      </StyledSettingsSectionStack>
    </Section>
  );
};
