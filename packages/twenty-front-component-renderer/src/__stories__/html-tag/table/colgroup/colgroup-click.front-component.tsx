import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const ColgroupClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="colgroup:click">
      <table style={{ width: 200 }}>
        <colgroup
          data-testid="subject"
          onClick={(event) => {
            setInteractionCount((previous) => previous + 1);
            pushEvent(event);
          }}
          tabIndex={0}
        >
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td>cell</td>
          </tr>
        </tbody>
      </table>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-colgroup-c-click-00000000-0000-0000-0000-000000000020',
  name: 'colgroup-click-front-component',
  description: 'Front component covering click on <colgroup>',
  component: ColgroupClickFrontComponent,
});
