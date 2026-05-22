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

const SURFACE_STYLE = {
  width: 200,
  height: 80,
  border: '1px solid #d1d5db',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  userSelect: 'none' as const,
  backgroundColor: '#f3f4f6',
};

const ClickScenario = () => {
  const [clickCount, setClickCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div
        data-testid="subject"
        onClick={(event) => {
          setClickCount((previous) => previous + 1);
          pushEvent(event);
        }}
        style={SURFACE_STYLE}
      >
        Click me
      </div>
      <span data-testid="front-component-value">{clickCount}</span>
      <EventLog entries={entries} />
    </>
  );
};

const DoubleClickScenario = () => {
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div
        data-testid="subject"
        onDoubleClick={(event) => {
          setDoubleClickCount((previous) => previous + 1);
          pushEvent(event);
        }}
        style={SURFACE_STYLE}
      >
        Double click me
      </div>
      <span data-testid="front-component-value">{doubleClickCount}</span>
      <EventLog entries={entries} />
    </>
  );
};

const MouseEnterLeaveScenario = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div
        data-testid="subject"
        onMouseEnter={(event) => pushEvent(event)}
        onMouseLeave={(event) => pushEvent(event)}
        style={SURFACE_STYLE}
      >
        Hover me
      </div>
      <div data-testid="hover-exit" style={SURFACE_STYLE}>
        Exit target
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const PropertiesScenario = () => (
  <div
    data-testid="subject"
    id={PROPERTY_FIXTURE.id}
    className={PROPERTY_FIXTURE.className}
    title={PROPERTY_FIXTURE.title}
    role={PROPERTY_FIXTURE.role}
    aria-label={PROPERTY_FIXTURE.ariaLabel}
    tabIndex={PROPERTY_FIXTURE.tabIndex}
  >
    content
  </div>
);

const SCENARIOS: Record<string, () => JSX.Element> = {
  'div:click': ClickScenario,
  'div:dblclick': DoubleClickScenario,
  'div:mouseenter-leave': MouseEnterLeaveScenario,
  'div:properties': PropertiesScenario,
};

const DivFrontComponent = () => {
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
  universalIdentifier: 'fc-div0-00000000-0000-0000-0000-000000000020',
  name: 'div-front-component',
  description: 'Front component covering <div> event/property scenarios',
  component: DivFrontComponent,
});
