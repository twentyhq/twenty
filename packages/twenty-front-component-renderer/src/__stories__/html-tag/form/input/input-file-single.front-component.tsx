import { defineFrontComponent } from 'twenty-sdk/define';

import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  LABEL_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from '@/__stories__/shared/front-components/styles';

const InputFileSingleFrontComponent = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="input:file:single">
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Single file</label>
        <input
          data-testid="subject"
          type="file"
          onChange={(event) => pushEvent(event)}
        />
      </div>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-input-file-single-00000000-0000-0000-0000-000000000020',
  name: 'input-file-single-front-component',
  description: 'Front component covering single-file <input type="file">',
  component: InputFileSingleFrontComponent,
});
