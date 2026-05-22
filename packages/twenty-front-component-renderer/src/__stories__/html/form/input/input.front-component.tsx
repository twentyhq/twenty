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
  ROW_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from '../../../shared/front-components/styles';

const CARET_INITIAL_VALUE = 'Hello world';

const noop = () => undefined;

const TextValueScenario = () => {
  const [value, setValue] = useState('');
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Text input</label>
        <input
          data-testid="subject"
          type="text"
          placeholder="Type here..."
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            pushEvent(event);
          }}
          style={INPUT_STYLE}
        />
        <span data-testid="front-component-value">{value}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const CheckboxScenario = () => {
  const [checked, setChecked] = useState(false);
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div style={ROW_STYLE}>
        <input
          data-testid="subject"
          type="checkbox"
          checked={checked}
          onChange={(event) => {
            setChecked(event.target.checked);
            pushEvent(event);
          }}
        />
        <label style={LABEL_STYLE}>Check me</label>
        <span data-testid="front-component-value">{String(checked)}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const FileSingleScenario = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Single file</label>
        <input
          data-testid="subject"
          type="file"
          onChange={(event) => pushEvent(event)}
        />
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const FileMultipleScenario = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Multiple files</label>
        <input
          data-testid="subject"
          type="file"
          multiple
          accept="image/*"
          onChange={(event) => pushEvent(event)}
        />
      </div>
      <EventLog entries={entries} />
    </>
  );
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
          style={INPUT_STYLE}
        />
        <span data-testid="front-component-value">{lastKey}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const FocusBlurScenario = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <>
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Focus / Blur</label>
        <input
          data-testid="subject"
          type="text"
          onFocus={(event) => pushEvent(event)}
          onBlur={(event) => pushEvent(event)}
          style={INPUT_STYLE}
        />
      </div>
      <input data-testid="blur-target" type="text" style={INPUT_STYLE} />
      <EventLog entries={entries} />
    </>
  );
};

const CaretScenario = () => {
  const [value, setValue] = useState(CARET_INITIAL_VALUE);

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
      <span data-testid="front-component-value">{value}</span>
    </div>
  );
};

const TextPropertiesScenario = () => (
  <input
    data-testid="subject"
    id={PROPERTY_FIXTURE.id}
    className={PROPERTY_FIXTURE.className}
    title={PROPERTY_FIXTURE.title}
    role={PROPERTY_FIXTURE.role}
    aria-label={PROPERTY_FIXTURE.ariaLabel}
    tabIndex={PROPERTY_FIXTURE.tabIndex}
    type={PROPERTY_FIXTURE.type}
    name={PROPERTY_FIXTURE.name}
    placeholder={PROPERTY_FIXTURE.placeholder}
    value={PROPERTY_FIXTURE.textValue}
    onChange={noop}
  />
);

const NumberPropertiesScenario = () => (
  <input
    data-testid="subject"
    id={PROPERTY_FIXTURE.id}
    className={PROPERTY_FIXTURE.className}
    title={PROPERTY_FIXTURE.title}
    role={PROPERTY_FIXTURE.role}
    aria-label={PROPERTY_FIXTURE.ariaLabel}
    tabIndex={PROPERTY_FIXTURE.tabIndex}
    type="number"
    name={PROPERTY_FIXTURE.name}
    value={String(PROPERTY_FIXTURE.numberValue)}
    onChange={noop}
  />
);

const SCENARIOS: Record<string, () => JSX.Element> = {
  'input:text:value': TextValueScenario,
  'input:checkbox:checked': CheckboxScenario,
  'input:file:single': FileSingleScenario,
  'input:file:multiple': FileMultipleScenario,
  'input:text:keyboard': KeyboardScenario,
  'input:text:focus-blur': FocusBlurScenario,
  'input:text:caret': CaretScenario,
  'input:text:properties': TextPropertiesScenario,
  'input:number:properties': NumberPropertiesScenario,
};

const InputFrontComponent = () => {
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
  universalIdentifier: 'fc-input-00000000-0000-0000-0000-000000000020',
  name: 'input-front-component',
  description: 'Front component covering <input> event/property scenarios',
  component: InputFrontComponent,
});
