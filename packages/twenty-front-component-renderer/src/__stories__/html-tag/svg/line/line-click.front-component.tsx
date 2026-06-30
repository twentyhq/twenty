import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { SVG_ROOT_STYLE } from '@/__stories__/shared/front-components/styles';

const LineClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="line:click">
      <svg viewBox="0 0 200 120" style={SVG_ROOT_STYLE}>
        <line
          data-testid="subject"
          x1="20"
          y1="60"
          x2="180"
          y2="60"
          stroke="#2563eb"
          strokeWidth="20"
          onClick={(event) => {
            setInteractionCount((previous) => previous + 1);
            pushEvent(event);
          }}
          tabIndex={0}
        />
      </svg>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-line-c-click-00000000-0000-0000-0000-000000000020',
  name: 'line-click-front-component',
  description: 'Front component covering click on <line>',
  component: LineClickFrontComponent,
});
