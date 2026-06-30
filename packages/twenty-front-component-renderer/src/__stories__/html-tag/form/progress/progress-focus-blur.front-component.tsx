import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_INLINE_STYLE } from '@/__stories__/shared/front-components/styles';

const ProgressFocusBlurFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="progress:focus-blur">
      <progress
        data-testid="subject"
        value={30}
        max={100}
        onFocus={(event) => {
          setInteractionCount((previous) => previous + 1);
          pushEvent(event);
        }}
        onBlur={(event) => pushEvent(event)}
        tabIndex={0}
        style={FILL_INLINE_STYLE}
      />
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-progress-fb-fb-00000000-0000-0000-0000-000000000020',
  name: 'progress-focus-blur-front-component',
  description: 'Front component covering focus-blur on <progress>',
  component: ProgressFocusBlurFrontComponent,
});
