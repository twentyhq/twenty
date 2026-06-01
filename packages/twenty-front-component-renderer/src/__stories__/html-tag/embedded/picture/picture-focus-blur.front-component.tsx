import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { FILL_RECT_STYLE } from '@/__stories__/shared/front-components/styles';

const PictureFocusBlurFrontComponent = () => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="picture:focus-blur">
      <picture
        data-testid="subject"
        onFocus={(event) => {
          setInteractionCount((previous) => previous + 1);
          pushEvent(event);
        }}
        onBlur={(event) => pushEvent(event)}
        tabIndex={0}
        style={FILL_RECT_STYLE}
      >
        <img
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'/>"
          alt="probe"
        />
      </picture>
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-picture-fb-fb-00000000-0000-0000-0000-000000000020',
  name: 'picture-focus-blur-front-component',
  description: 'Front component covering focus-blur on <picture>',
  component: PictureFocusBlurFrontComponent,
});
