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

const InputEditingFrontComponent = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="input:text:editing">
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Editing input</label>
        <input
          data-testid="subject"
          type="text"
          onBeforeInput={pushEvent}
          onCompositionStart={pushEvent}
          onCompositionUpdate={pushEvent}
          onCompositionEnd={pushEvent}
          style={INPUT_STYLE}
        />
      </div>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-input-editing-00000000-0000-0000-0000-000000000020',
  name: 'input-editing-front-component',
  description:
    'Front component covering beforeinput and composition events on <input>',
  component: InputEditingFrontComponent,
});
