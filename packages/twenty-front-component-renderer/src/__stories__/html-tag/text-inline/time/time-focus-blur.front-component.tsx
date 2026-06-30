import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_INLINE_STYLE } from '@/__stories__/shared/front-components/styles';

const TimeFocusBlurFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="time:focus-blur">
      <time
        data-testid="subject"
        onFocus={(event) => {
          setInteractionCount((previous) => previous + 1);
          pushEvent(event);
        }}
        onBlur={(event) => pushEvent(event)}
        tabIndex={0}
        style={FILL_INLINE_STYLE}
      >
        time
      </time>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-time-fb-fb-00000000-0000-0000-0000-000000000020',
  name: 'time-focus-blur-front-component',
  description: 'Front component covering focus-blur on <time>',
  component: TimeFocusBlurFrontComponent,
});
