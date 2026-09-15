import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_TABLE_CELL_STYLE } from '@/__stories__/shared/front-components/styles';

const TheadClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="thead:click">
      <table style={{ width: 200 }}>
        <thead
          data-testid="subject"
          onClick={(event) => {
            setInteractionCount((previous) => previous + 1);
            pushEvent(event);
          }}
          tabIndex={0}
        >
          <tr>
            <th style={FILL_TABLE_CELL_STYLE}>thead</th>
          </tr>
        </thead>
      </table>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-thead-c-click-00000000-0000-0000-0000-000000000020',
  name: 'thead-click-front-component',
  description: 'Front component covering click on <thead>',
  component: TheadClickFrontComponent,
});
