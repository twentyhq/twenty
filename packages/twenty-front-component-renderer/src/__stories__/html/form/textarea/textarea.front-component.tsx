import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';

import {
  EventLog,
  useEventLog,
} from '../../../shared/front-components/event-log';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';
import { PROPERTY_FIXTURE } from '../../../shared/front-components/property-fixture';
import {
  INPUT_STYLE,
  LABEL_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from '../../../shared/front-components/styles';

const CARET_INITIAL_VALUE = 'Hello world';

const noop = () => undefined;

const ValueScenario = () => {
  const [value, setValue] = useState('');
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Textarea</label>
        <textarea
          data-testid="subject"
          placeholder="Type a note..."
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            pushEvent(event);
          }}
          style={INPUT_STYLE}
          rows={3}
        />
        <span data-testid="front-component-value">{value}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const CaretScenario = () => {
  const [value, setValue] = useState(CARET_INITIAL_VALUE);

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
      <span data-testid="front-component-value">{value}</span>
    </div>
  );
};

const PropertiesScenario = () => (
  <textarea
    data-testid="subject"
    id={PROPERTY_FIXTURE.id}
    className={PROPERTY_FIXTURE.className}
    title={PROPERTY_FIXTURE.title}
    role={PROPERTY_FIXTURE.role}
    aria-label={PROPERTY_FIXTURE.ariaLabel}
    tabIndex={PROPERTY_FIXTURE.tabIndex}
    name={PROPERTY_FIXTURE.name}
    placeholder={PROPERTY_FIXTURE.placeholder}
    rows={PROPERTY_FIXTURE.rows}
    cols={PROPERTY_FIXTURE.cols}
    value={PROPERTY_FIXTURE.textValue}
    onChange={noop}
  />
);

const SCENARIOS: Record<string, () => JSX.Element> = {
  'textarea:value': ValueScenario,
  'textarea:caret': CaretScenario,
  'textarea:properties': PropertiesScenario,
};

const TextareaFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  const Scenario = SCENARIOS[scenarioId];

  if (Scenario === undefined) {
    return <UnknownScenario scenarioId={scenarioId} />;
  }

  return (
    <FrontComponentCard scenarioId={scenarioId}>
      <Scenario />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-txta-00000000-0000-0000-0000-000000000020',
  name: 'textarea-front-component',
  description: 'Front component covering <textarea> event/property scenarios',
  component: TextareaFrontComponent,
});
