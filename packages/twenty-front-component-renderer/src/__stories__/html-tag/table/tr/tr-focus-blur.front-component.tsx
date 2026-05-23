import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_TABLE_CELL_STYLE } from '@/__stories__/shared/front-components/styles';

const TrFocusBlurFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="tr:focus-blur">
      <table style={{ width: 200 }}>
        <tbody>
          <tr
            data-testid="subject"
            onFocus={(event) => {
              setInteractionCount((previous) => previous + 1);
              pushEvent(event);
            }}
            onBlur={(event) => pushEvent(event)}
            tabIndex={0}
          >
            <td style={FILL_TABLE_CELL_STYLE}>row</td>
          </tr>
        </tbody>
      </table>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-tr-fb-fb-00000000-0000-0000-0000-000000000020',
  name: 'tr-focus-blur-front-component',
  description: 'Front component covering focus-blur on <tr>',
  component: TrFocusBlurFrontComponent,
});
