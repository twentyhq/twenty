import { useState } from 'react';
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

const DivDoubleClickFrontComponent = () => {
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="div:dblclick">
      <div
        data-testid="subject"
        onDoubleClick={(event) => {
          setDoubleClickCount((previous) => previous + 1);
          pushEvent(event);
        }}
        style={SURFACE_STYLE}
      >
        Double click me
      </div>
      <span data-testid="front-component-value">{doubleClickCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-div-dblclick-00000000-0000-0000-0000-000000000020',
  name: 'div-dblclick-front-component',
  description: 'Front component covering double click event on <div>',
  component: DivDoubleClickFrontComponent,
});
