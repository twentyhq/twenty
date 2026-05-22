import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-shared/utils';

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

const noop = () => undefined;

const ValueScenario = () => {
  const [value, setValue] = useState('alpha');
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Select</label>
        <select
          data-testid="subject"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            pushEvent(event);
          }}
          style={INPUT_STYLE}
        >
          <option value="alpha">Alpha</option>
          <option value="beta">Beta</option>
          <option value="gamma">Gamma</option>
        </select>
        <span data-testid="front-component-value">{value}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const PropertiesScenario = () => (
  <select
    data-testid="subject"
    id={PROPERTY_FIXTURE.id}
    className={PROPERTY_FIXTURE.className}
    title={PROPERTY_FIXTURE.title}
    role={PROPERTY_FIXTURE.role}
    aria-label={PROPERTY_FIXTURE.ariaLabel}
    tabIndex={PROPERTY_FIXTURE.tabIndex}
    name={PROPERTY_FIXTURE.name}
    value="alpha"
    onChange={noop}
  >
    <option value="alpha">alpha</option>
    <option value="beta">beta</option>
  </select>
);

const SCENARIOS: Record<string, () => JSX.Element> = {
  'select:value': ValueScenario,
  'select:properties': PropertiesScenario,
};

const SelectFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  const Scenario = SCENARIOS[scenarioId];

  if (!isDefined(Scenario)) {
    return <UnknownScenario scenarioId={scenarioId} />;
  }

  return (
    <FrontComponentCard scenarioId={scenarioId}>
      <Scenario />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-slct-00000000-0000-0000-0000-000000000020',
  name: 'select-front-component',
  description: 'Front component covering <select> event/property scenarios',
  component: SelectFrontComponent,
});
