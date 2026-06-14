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

const SelectValueFrontComponent = () => {
  const [value, setValue] = useState('alpha');
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="select:value">
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
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-slct-value-00000000-0000-0000-0000-000000000020',
  name: 'select-value-front-component',
  description: 'Front component covering value round-trip on <select>',
  component: SelectValueFrontComponent,
});
