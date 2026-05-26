import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_INLINE_STYLE } from '@/__stories__/shared/front-components/styles';

const DfnClickFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="dfn:click">
      <dfn
        data-testid="subject"
        onClick={(event) => {
          setInteractionCount((previous) => previous + 1);
          pushEvent(event);
        }}
        tabIndex={0}
        style={FILL_INLINE_STYLE}
      >
        dfn
      </dfn>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-dfn-c-click-00000000-0000-0000-0000-000000000020',
  name: 'dfn-click-front-component',
  description: 'Front component covering click on <dfn>',
  component: DfnClickFrontComponent,
});
