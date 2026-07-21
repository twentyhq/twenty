import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_RECT_STYLE } from '@/__stories__/shared/front-components/styles';

const DivDragDropFrontComponent = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="div:drag-drop">
      <div
        data-testid="subject"
        onDragStart={pushEvent}
        onDragEnd={pushEvent}
        style={FILL_RECT_STYLE}
      >
        drag source
      </div>
      <div
        data-testid="drop-zone"
        onDragOver={pushEvent}
        onDrop={pushEvent}
        style={FILL_RECT_STYLE}
      >
        drop zone
      </div>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-div-dnd-00000000-0000-0000-0000-000000000020',
  name: 'div-drag-drop-front-component',
  description: 'Front component covering drag and drop events on <div>',
  component: DivDragDropFrontComponent,
});
