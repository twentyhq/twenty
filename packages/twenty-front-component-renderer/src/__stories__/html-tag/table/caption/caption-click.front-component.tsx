import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const CaptionClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="caption:click">
      <table style={{ width: 200 }}>
        <caption
          data-testid="subject"
          onClick={(event) => {
            setInteractionCount((previous) => previous + 1);
            pushEvent(event);
          }}
          tabIndex={0}
        >
          caption
        </caption>
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
    'fc-caption-c-click-00000000-0000-0000-0000-000000000020',
  name: 'caption-click-front-component',
  description: 'Front component covering click on <caption>',
  component: CaptionClickFrontComponent,
});
