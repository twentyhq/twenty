import { defineFrontComponent } from 'twenty-sdk/define';

import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const SURFACE_STYLE = {
  width: 200,
  height: 80,
  border: '1px solid #d1d5db',
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'crosshair',
  userSelect: 'none' as const,
  backgroundColor: '#f3f4f6',
};

const DivPointerMoveFrontComponent = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="div:mousemove-pointermove">
      <div
        data-testid="subject"
        onMouseMove={(event) => pushEvent(event)}
        onPointerMove={(event) => pushEvent(event)}
        style={SURFACE_STYLE}
      >
        Move pointer
      </div>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-div-pmm-00000000-0000-0000-0000-000000000020',
  name: 'div-pointermove-front-component',
  description: 'Front component covering mousemove/pointermove on <div>',
  component: DivPointerMoveFrontComponent,
});
