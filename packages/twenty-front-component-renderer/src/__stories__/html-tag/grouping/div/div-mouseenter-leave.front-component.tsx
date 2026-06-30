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
  cursor: 'pointer',
  userSelect: 'none' as const,
  backgroundColor: '#f3f4f6',
};

const DivMouseEnterLeaveFrontComponent = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="div:mouseenter-leave">
      <div
        data-testid="subject"
        onMouseEnter={(event) => pushEvent(event)}
        onMouseLeave={(event) => pushEvent(event)}
        style={SURFACE_STYLE}
      >
        Hover me
      </div>
      <div data-testid="hover-exit" style={SURFACE_STYLE}>
        Exit target
      </div>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-div-mel-00000000-0000-0000-0000-000000000020',
  name: 'div-mouseenter-leave-front-component',
  description: 'Front component covering mouseenter/mouseleave on <div>',
  component: DivMouseEnterLeaveFrontComponent,
});
