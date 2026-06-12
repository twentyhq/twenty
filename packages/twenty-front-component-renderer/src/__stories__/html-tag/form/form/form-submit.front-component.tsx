import { type FormEvent, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  BUTTON_STYLE,
  INPUT_STYLE,
} from '@/__stories__/shared/front-components/styles';

const FormSubmitFrontComponent = () => {
  const [fieldValue, setFieldValue] = useState('value-from-form');
  const [submittedValue, setSubmittedValue] = useState<string | null>(null);
  const { entries, pushEvent } = useEventLog();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedValue(fieldValue);
    pushEvent(event);
  };

  return (
    <FrontComponentCard title="form:submit">
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
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-form-submit-00000000-0000-0000-0000-000000000020',
  name: 'form-submit-front-component',
  description: 'Front component covering submit event on <form>',
  component: FormSubmitFrontComponent,
});
