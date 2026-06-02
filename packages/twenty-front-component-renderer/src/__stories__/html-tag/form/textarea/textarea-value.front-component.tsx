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

const TextareaValueFrontComponent = () => {
  const [value, setValue] = useState('');
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="textarea:value">
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
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-txta-value-00000000-0000-0000-0000-000000000020',
  name: 'textarea-value-front-component',
  description: 'Front component covering value round-trip on <textarea>',
  component: TextareaValueFrontComponent,
});
