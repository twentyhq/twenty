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

const InputKeyboardFrontComponent = () => {
  const [lastKey, setLastKey] = useState('');
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="input:text:keyboard">
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Keyboard input</label>
        <input
          data-testid="subject"
          type="text"
          onKeyDown={(event) => {
            setLastKey(event.key);
            pushEvent(event);
          }}
          onKeyUp={(event) => pushEvent(event)}
          style={INPUT_STYLE}
        />
        <span data-testid="front-component-value">{lastKey}</span>
      </div>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-input-keyboard-00000000-0000-0000-0000-000000000020',
  name: 'input-keyboard-front-component',
  description: 'Front component covering keyboard events on <input>',
  component: InputKeyboardFrontComponent,
});
