import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  INPUT_STYLE,
  LABEL_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from '@/__stories__/shared/front-components/styles';

const InputTextValueFrontComponent = () => {
  const [value, setValue] = useState('');
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="input:text:value">
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
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-input-text-value-00000000-0000-0000-0000-000000000020',
  name: 'input-text-value-front-component',
  description: 'Front component covering <input type="text"> value round-trip',
  component: InputTextValueFrontComponent,
});
