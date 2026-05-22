import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { ProbeCard, UnknownScenario } from './shared/probe-card';
import {
  INPUT_STYLE,
  LABEL_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from './shared/probe-styles';

const INITIAL_VALUE = 'Hello world';

const InputCaretScenario = () => {
  const [value, setValue] = useState(INITIAL_VALUE);

  return (
    <div style={SUBJECT_WRAPPER_STYLE}>
      <label style={LABEL_STYLE}>Text input (pre-filled)</label>
      <input
        data-testid="subject"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={INPUT_STYLE}
      />
      <span data-testid="subject-state">{value}</span>
    </div>
  );
};

const TextareaCaretScenario = () => {
  const [value, setValue] = useState(INITIAL_VALUE);

  return (
    <div style={SUBJECT_WRAPPER_STYLE}>
      <label style={LABEL_STYLE}>Textarea (pre-filled)</label>
      <textarea
        data-testid="subject"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={INPUT_STYLE}
        rows={3}
      />
      <span data-testid="subject-state">{value}</span>
    </div>
  );
};

const SCENARIOS: Record<string, () => JSX.Element> = {
  'caret:input:mid-string': InputCaretScenario,
  'caret:textarea:mid-string': TextareaCaretScenario,
};

const CaretProbe = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  const Scenario = SCENARIOS[scenarioId];

  if (Scenario === undefined) {
    return <UnknownScenario scenarioId={scenarioId} />;
  }

  return (
    <ProbeCard scenarioId={scenarioId}>
      <Scenario />
    </ProbeCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'probe-cart-00000000-0000-0000-0000-000000000020',
  name: 'caret-probe',
  description: 'Probe component covering caret preservation behavior',
  component: CaretProbe,
});
