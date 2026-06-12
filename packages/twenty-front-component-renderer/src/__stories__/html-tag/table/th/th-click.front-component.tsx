import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_TABLE_CELL_STYLE } from '@/__stories__/shared/front-components/styles';

const ThClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="th:click">
      <table>
        <tbody>
          <tr>
            <th
              data-testid="subject"
              onClick={(event) => {
                setInteractionCount((previous) => previous + 1);
                pushEvent(event);
              }}
              tabIndex={0}
              style={FILL_TABLE_CELL_STYLE}
            >
              th
            </th>
          </tr>
        </tbody>
      </table>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-th-c-click-00000000-0000-0000-0000-000000000020',
  name: 'th-click-front-component',
  description: 'Front component covering click on <th>',
  component: ThClickFrontComponent,
});
