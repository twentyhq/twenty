import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const OptionClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="option:click">
      <select defaultValue="alpha">
        <>
          <option
            data-testid="subject"
            value="alpha"
            onClick={(event) => {
              setInteractionCount((previous) => previous + 1);
              pushEvent(event);
            }}
          >
            alpha
          </option>
          <option value="beta">beta</option>
        </>
      </select>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-option-c-click-00000000-0000-0000-0000-000000000020',
  name: 'option-click-front-component',
  description: 'Front component covering click on <option>',
  component: OptionClickFrontComponent,
});
