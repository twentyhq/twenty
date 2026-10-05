import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  INPUT_STYLE,
  LABEL_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from '@/__stories__/shared/front-components/styles';

const InputKeydownOnlyFrontComponent = () => {
  const [submittedValues, setSubmittedValues] = useState<string[]>([]);

  return (
    <FrontComponentCard title="input:text:keydown-only">
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label style={LABEL_STYLE}>Uncontrolled input, Enter submits</label>
        <input
          data-testid="subject"
          type="text"
          onKeyDown={(event) => {
            if (event.key !== 'Enter') {
              return;
            }

            const submittedValue = event.currentTarget.value;

            setSubmittedValues((previousSubmittedValues) => [
              ...previousSubmittedValues,
              submittedValue,
            ]);
            event.currentTarget.value = '';
          }}
          style={INPUT_STYLE}
        />
        <span data-testid="front-component-value">
          {submittedValues.join(',')}
        </span>
      </div>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-input-keydown-only-00000000-0000-0000-0000-000000000020',
  name: 'input-keydown-only-front-component',
  description:
    'Front component covering an uncontrolled <input> read and cleared from onKeyDown',
  component: InputKeydownOnlyFrontComponent,
});
