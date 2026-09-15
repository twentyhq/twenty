import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_RECT_STYLE } from '@/__stories__/shared/front-components/styles';

const H3FocusBlurFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="h3:focus-blur">
      <h3
        data-testid="subject"
        onFocus={(event) => {
          setInteractionCount((previous) => previous + 1);
          pushEvent(event);
        }}
        onBlur={(event) => pushEvent(event)}
        tabIndex={0}
        style={FILL_RECT_STYLE}
      >
        h3
      </h3>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-h3-fb-fb-00000000-0000-0000-0000-000000000020',
  name: 'h3-focus-blur-front-component',
  description: 'Front component covering focus-blur on <h3>',
  component: H3FocusBlurFrontComponent,
});
