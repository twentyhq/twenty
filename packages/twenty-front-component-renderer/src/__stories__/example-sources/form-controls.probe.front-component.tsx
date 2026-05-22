import { type FormEvent, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { EventLog, useEventLog } from './shared/event-log';
import { ProbeCard, UnknownScenario } from './shared/probe-card';
import {
  BUTTON_STYLE,
  INPUT_STYLE,
  LABEL_STYLE,
  ROW_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from './shared/probe-styles';

const InputTextValueScenario = () => {
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
        <span data-testid="subject-state">{value}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const InputCheckboxScenario = () => {
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
        <span data-testid="subject-state">{String(checked)}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const InputFileSingleScenario = () => {
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

const InputFileMultipleScenario = () => {
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

const TextareaValueScenario = () => {
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
        <span data-testid="subject-state">{value}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const SelectValueScenario = () => {
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
        <span data-testid="subject-state">{value}</span>
      </div>
      <EventLog entries={entries} />
    </>
  );
};

const FormSubmitScenario = () => {
  const [fieldValue, setFieldValue] = useState('value-from-form');
  const [submittedValue, setSubmittedValue] = useState<string | null>(null);
  const { entries, pushEvent } = useEventLog();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedValue(fieldValue);
    pushEvent(event);
  };

  return (
    <>
      <form
        data-testid="subject"
        action="javascript:void(0);"
        onSubmit={handleSubmit}
      >
        <input
          data-testid="form-field"
          type="text"
          name="field"
          value={fieldValue}
          onChange={(event) => setFieldValue(event.target.value)}
          style={INPUT_STYLE}
        />
        <button data-testid="submit-button" type="submit" style={BUTTON_STYLE}>
          Submit
        </button>
      </form>
      <span data-testid="subject-state">{submittedValue ?? 'none'}</span>
      <EventLog entries={entries} />
    </>
  );
};

const ButtonClickScenario = () => {
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
      <span data-testid="subject-state">{clickCount}</span>
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

const SCENARIOS: Record<string, () => JSX.Element> = {
  'form-controls:input.text:value': InputTextValueScenario,
  'form-controls:input.checkbox:checked': InputCheckboxScenario,
  'form-controls:input.file:single': InputFileSingleScenario,
  'form-controls:input.file:multiple': InputFileMultipleScenario,
  'form-controls:textarea:value': TextareaValueScenario,
  'form-controls:select:value': SelectValueScenario,
  'form-controls:form:submit': FormSubmitScenario,
  'form-controls:button:click': ButtonClickScenario,
  'form-controls:input.text:focus-blur': FocusBlurScenario,
};

const FormControlsProbe = () => {
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
  universalIdentifier: 'probe-form-00000000-0000-0000-0000-000000000020',
  name: 'form-controls-probe',
  description: 'Probe component covering form-control elements per scenario',
  component: FormControlsProbe,
});
