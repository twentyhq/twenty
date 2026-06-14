import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  LABEL_STYLE,
  ROW_STYLE,
} from '@/__stories__/shared/front-components/styles';

const InputCheckboxFrontComponent = () => {
  const [checked, setChecked] = useState(false);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="input:checkbox:checked">
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
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-input-checkbox-00000000-0000-0000-0000-000000000020',
  name: 'input-checkbox-front-component',
  description: 'Front component covering <input type="checkbox">',
  component: InputCheckboxFrontComponent,
});
