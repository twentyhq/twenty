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
import { BUTTON_STYLE } from '../../../shared/front-components/styles';

const ClickScenario = () => {
  const [clickCount, setClickCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <button
        data-testid="subject"
        type="button"
        onClick={(event) => {
          setClickCount((previous) => previous + 1);
          pushEvent(event);
        }}
        style={BUTTON_STYLE}
      >
        Click me
      </button>
      <span data-testid="front-component-value">{clickCount}</span>
      <EventLog entries={entries} />
    </>
  );
};

const PropertiesScenario = () => (
  <button
    data-testid="subject"
    type="button"
    id={PROPERTY_FIXTURE.id}
    className={PROPERTY_FIXTURE.className}
    title={PROPERTY_FIXTURE.title}
    role={PROPERTY_FIXTURE.role}
    aria-label={PROPERTY_FIXTURE.ariaLabel}
    tabIndex={PROPERTY_FIXTURE.tabIndex}
  >
    button
  </button>
);

const SCENARIOS: Record<string, () => JSX.Element> = {
  'button:click': ClickScenario,
  'button:properties': PropertiesScenario,
};

const ButtonFrontComponent = () => {
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
  universalIdentifier: 'fc-btn0-00000000-0000-0000-0000-000000000020',
  name: 'button-front-component',
  description: 'Front component covering <button> scenarios',
  component: ButtonFrontComponent,
});
