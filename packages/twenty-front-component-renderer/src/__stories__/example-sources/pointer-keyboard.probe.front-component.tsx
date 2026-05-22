import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { EventLog, useEventLog } from './shared/event-log';
import { ProbeCard, UnknownScenario } from './shared/probe-card';
import {
  INPUT_STYLE,
  LABEL_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from './shared/probe-styles';

const KEYBOARD_SURFACE_STYLE = {
  ...INPUT_STYLE,
  width: 240,
};

const MOUSE_SURFACE_STYLE = {
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

const KeyboardScenario = () => {
  const [lastKey, setLastKey] = useState('');
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Keyboard input</label>
        <input
          data-testid="subject"
          type="text"
          onKeyDown={(event) => {
            setLastKey(
              (event as unknown as { detail?: { key?: string } }).detail?.key ??
                event.key,
            );
            pushEvent(event);
          }}
          onKeyUp={(event) => pushEvent(event)}
          style={KEYBOARD_SURFACE_STYLE}
        />
        <span data-testid="subject-state">{lastKey}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
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
        style={MOUSE_SURFACE_STYLE}
      >
        Click me
      </div>
      <span data-testid="subject-state">{clickCount}</span>
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
        style={MOUSE_SURFACE_STYLE}
      >
        Double click me
      </div>
      <span data-testid="subject-state">{doubleClickCount}</span>
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
        style={MOUSE_SURFACE_STYLE}
      >
        Hover me
      </div>
      <div data-testid="hover-exit" style={MOUSE_SURFACE_STYLE}>
        Exit target
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const SCENARIOS: Record<string, () => JSX.Element> = {
  'pointer-keyboard:input:keyboard': KeyboardScenario,
  'pointer-keyboard:div:click': ClickScenario,
  'pointer-keyboard:div:dblclick': DoubleClickScenario,
  'pointer-keyboard:div:mouseenter-leave': MouseEnterLeaveScenario,
};

const PointerKeyboardProbe = () => {
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
  universalIdentifier: 'probe-pntr-00000000-0000-0000-0000-000000000020',
  name: 'pointer-keyboard-probe',
  description: 'Probe component covering pointer and keyboard events',
  component: PointerKeyboardProbe,
});
