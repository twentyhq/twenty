import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { SVG_ROOT_STYLE } from '@/__stories__/shared/front-components/styles';
import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

const SvgPointerFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const [pointerCoordinates, setPointerCoordinates] = useState('');
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="svg:pointer">
      <svg
        data-testid="subject"
        viewBox="0 0 200 120"
        onPointerDown={(event) => {
          setInteractionCount((previous) => previous + 1);
          setPointerCoordinates(`${event.clientX},${event.clientY}`);
          pushEvent(event);
        }}
        onPointerMove={(event) => {
          pushEvent(event);
        }}
        tabIndex={0}
        style={SVG_ROOT_STYLE}
      >
        <rect x="20" y="20" width="160" height="80" fill="#2563eb" />
      </svg>
      <span data-testid="front-component-value">{interactionCount}</span>
      <span data-testid="pointer-coordinates">{pointerCoordinates}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-svg-c-pointer-0000000-0000-0000-0000-000000000021',
  name: 'svg-pointer-front-component',
  description: 'Front component covering pointer events on <svg>',
  component: SvgPointerFrontComponent,
});
