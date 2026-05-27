import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_RECT_STYLE } from '@/__stories__/shared/front-components/styles';

const H2ClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="h2:click">
      <h2
        data-testid="subject"
        onClick={(event) => {
          setInteractionCount((previous) => previous + 1);
          pushEvent(event);
        }}
        tabIndex={0}
        style={FILL_RECT_STYLE}
      >
        h2
      </h2>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-h2-c-click-00000000-0000-0000-0000-000000000020',
  name: 'h2-click-front-component',
  description: 'Front component covering click on <h2>',
  component: H2ClickFrontComponent,
});
