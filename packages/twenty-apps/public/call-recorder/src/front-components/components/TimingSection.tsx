import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';

import { StyledSettingsSectionStack } from 'src/front-components/components/StyledSettingsSectionStack';
import { TimingCounterRow } from 'src/front-components/components/TimingCounterRow';
import { CALL_RECORDER_TIMING_ROWS } from 'src/front-components/constants/call-recorder-settings-layout.constant';
import {
  type ApplicationVariableDraftByKey,
  type UpdateApplicationVariableDraft,
} from 'src/front-components/types/application-variable-draft.type';
import { type CallRecorderApplicationVariable } from 'src/front-components/types/call-recorder-application-variable.type';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';

type TimingSectionProps = {
  applicationVariables: Pick<
    CallRecorderApplicationVariable,
    'key' | 'value'
  >[];
  draftValueByVariableKey: ApplicationVariableDraftByKey;
  onDraftValueChange: UpdateApplicationVariableDraft;
};

export const TimingSection = ({
  applicationVariables,
  draftValueByVariableKey,
  onDraftValueChange,
}: TimingSectionProps) => (
  <Section>
    <H2Title
      title="Timing"
      description="When the recorder joins your meetings, gives up, or stops."
    />
    <StyledSettingsSectionStack>
      <Card rounded fullWidth>
        {CALL_RECORDER_TIMING_ROWS.map((row, rowIndex) => (
          <TimingCounterRow
            key={row.variableKey}
            variableKey={row.variableKey}
            title={row.title}
            description={row.description}
            Icon={row.Icon}
            divider={rowIndex < CALL_RECORDER_TIMING_ROWS.length - 1}
            persistedValue={getApplicationVariableValue({
              applicationVariables,
              variableKey: row.variableKey,
            })}
            draftValue={draftValueByVariableKey[row.variableKey]}
            onDraftValueChange={onDraftValueChange}
          />
        ))}
      </Card>
    </StyledSettingsSectionStack>
  </Section>
);
