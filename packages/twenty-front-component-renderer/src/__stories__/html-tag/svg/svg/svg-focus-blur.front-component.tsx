import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { SVG_ROOT_STYLE } from '@/__stories__/shared/front-components/styles';

const SvgFocusBlurFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="svg:focus-blur">
      <svg
        data-testid="subject"
        viewBox="0 0 200 120"
        onFocus={(event) => {
          setInteractionCount((previous) => previous + 1);
          pushEvent(event);
        }}
        onBlur={(event) => pushEvent(event)}
        tabIndex={0}
        style={SVG_ROOT_STYLE}
      >
        <rect x="20" y="20" width="160" height="80" fill="#2563eb" />
      </svg>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-svg-fb-fb-00000000-0000-0000-0000-000000000020',
  name: 'svg-focus-blur-front-component',
  description: 'Front component covering focus-blur on <svg>',
  component: SvgFocusBlurFrontComponent,
});
