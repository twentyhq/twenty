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

const InputTextFocusBlurFrontComponent = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="input:text:focus-blur">
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Focus / Blur</label>
        <input
          data-testid="subject"
          type="text"
          onFocus={(event) => pushEvent(event)}
          onBlur={(event) => pushEvent(event)}
          style={INPUT_STYLE}
        />
      </div>
      <input data-testid="blur-target" type="text" style={INPUT_STYLE} />
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-input-text-fb-00000000-0000-0000-0000-000000000020',
  name: 'input-text-focus-blur-front-component',
  description: 'Front component covering focus/blur on text <input>',
  component: InputTextFocusBlurFrontComponent,
});
