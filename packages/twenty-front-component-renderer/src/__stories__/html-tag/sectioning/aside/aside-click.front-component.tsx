import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_RECT_STYLE } from '@/__stories__/shared/front-components/styles';

const AsideClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="aside:click">
      <aside
        data-testid="subject"
        onClick={(event) => {
          setInteractionCount((previous) => previous + 1);
          pushEvent(event);
        }}
        tabIndex={0}
        style={FILL_RECT_STYLE}
      >
        aside
      </aside>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-aside-c-click-00000000-0000-0000-0000-000000000020',
  name: 'aside-click-front-component',
  description: 'Front component covering click on <aside>',
  component: AsideClickFrontComponent,
});
