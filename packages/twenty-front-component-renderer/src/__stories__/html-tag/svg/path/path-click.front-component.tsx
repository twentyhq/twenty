import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { SVG_ROOT_STYLE } from '@/__stories__/shared/front-components/styles';

const PathClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="path:click">
      <svg viewBox="0 0 200 120" style={SVG_ROOT_STYLE}>
        <path
          data-testid="subject"
          d="M20 20 L180 20 L180 100 L20 100 Z"
          fill="#2563eb"
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
  universalIdentifier: 'fc-path-c-click-00000000-0000-0000-0000-000000000020',
  name: 'path-click-front-component',
  description: 'Front component covering click on <path>',
  component: PathClickFrontComponent,
});
