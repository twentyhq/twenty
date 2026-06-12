import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { BUTTON_STYLE } from '@/__stories__/shared/front-components/styles';

const ButtonClickFrontComponent = () => {
  const [clickCount, setClickCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="button:click">
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
      <span data-testid="front-component-value">{clickCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-btn-click-00000000-0000-0000-0000-000000000020',
  name: 'button-click-front-component',
  description: 'Front component covering click event on <button>',
  component: ButtonClickFrontComponent,
});
