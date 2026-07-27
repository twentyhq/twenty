import { defineFrontComponent } from 'twenty-sdk/define';

import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  INPUT_STYLE,
  LABEL_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from '@/__stories__/shared/front-components/styles';

const InputClipboardFrontComponent = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="input:text:clipboard">
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Clipboard input</label>
        <input
          data-testid="subject"
          type="text"
          onPaste={pushEvent}
          onCopy={pushEvent}
          onCut={pushEvent}
          style={INPUT_STYLE}
        />
      </div>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-input-clipboard-00000000-0000-0000-0000-000000000020',
  name: 'input-clipboard-front-component',
  description: 'Front component covering clipboard events on <input>',
  component: InputClipboardFrontComponent,
});
