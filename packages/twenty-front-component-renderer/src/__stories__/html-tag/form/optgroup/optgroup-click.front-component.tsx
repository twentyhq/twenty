import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const OptgroupClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="optgroup:click">
      <select defaultValue="x">
        <optgroup
          data-testid="subject"
          label="group"
          onClick={(event) => {
            setInteractionCount((previous) => previous + 1);
            pushEvent(event);
          }}
        >
          <option value="x">inside</option>
        </optgroup>
      </select>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-optgroup-c-click-00000000-0000-0000-0000-000000000020',
  name: 'optgroup-click-front-component',
  description: 'Front component covering click on <optgroup>',
  component: OptgroupClickFrontComponent,
});
