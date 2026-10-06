import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  INPUT_STYLE,
  LABEL_STYLE,
  SUBJECT_WRAPPER_STYLE,
} from '@/__stories__/shared/front-components/styles';

const KEYDOWN_ONLY_INPUT_ID = 'input-keydown-only-subject';

const InputKeydownOnlyFrontComponent = () => {
  const [submittedValues, setSubmittedValues] = useState<string[]>([]);

  return (
    <FrontComponentCard title="input:text:keydown-only">
      <div style={SUBJECT_WRAPPER_STYLE}>
        <label htmlFor={KEYDOWN_ONLY_INPUT_ID} style={LABEL_STYLE}>
          Uncontrolled input, Enter submits
        </label>
        <input
          id={KEYDOWN_ONLY_INPUT_ID}
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
