import { type FormEvent, useState } from 'react';
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
  BUTTON_STYLE,
  INPUT_STYLE,
} from '../../../shared/front-components/styles';

const SubmitScenario = () => {
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
      <span data-testid="front-component-value">
        {submittedValue ?? 'none'}
      </span>
      <EventLog entries={entries} />
    </>
  );
};

const PropertiesScenario = () => (
  <form
    data-testid="subject"
    id={PROPERTY_FIXTURE.id}
    className={PROPERTY_FIXTURE.className}
    title={PROPERTY_FIXTURE.title}
    role={PROPERTY_FIXTURE.role}
    aria-label={PROPERTY_FIXTURE.ariaLabel}
    tabIndex={PROPERTY_FIXTURE.tabIndex}
  >
    form
  </form>
);

const SCENARIOS: Record<string, () => JSX.Element> = {
  'form:submit': SubmitScenario,
  'form:properties': PropertiesScenario,
};

const FormFrontComponent = () => {
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
  universalIdentifier: 'fc-form-00000000-0000-0000-0000-000000000020',
  name: 'form-front-component',
  description: 'Front component covering <form> submit/property scenarios',
  component: FormFrontComponent,
});
