import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { SVG_ROOT_STYLE } from '@/__stories__/shared/front-components/styles';

const PolylineClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="polyline:click">
      <svg viewBox="0 0 200 120" style={SVG_ROOT_STYLE}>
        <polyline
          data-testid="subject"
          points="20,80 100,20 180,80"
          stroke="#2563eb"
          strokeWidth="20"
          fill="none"
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
  universalIdentifier:
    'fc-polyline-c-click-00000000-0000-0000-0000-000000000020',
  name: 'polyline-click-front-component',
  description: 'Front component covering click on <polyline>',
  component: PolylineClickFrontComponent,
});
