import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  INPUT_STYLE,
  LABEL_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from '@/__stories__/shared/front-components/styles';

const CARET_INITIAL_VALUE = 'Hello world';

const InputCaretFrontComponent = () => {
  const [value, setValue] = useState(CARET_INITIAL_VALUE);

  return (
    <FrontComponentCard title="input:text:caret">
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Text input (pre-filled)</label>
        <input
          data-testid="subject"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          style={INPUT_STYLE}
        />
        <span data-testid="front-component-value">{value}</span>
      </div>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-input-caret-00000000-0000-0000-0000-000000000020',
  name: 'input-caret-front-component',
  description: 'Front component covering caret behavior on <input type="text">',
  component: InputCaretFrontComponent,
});
