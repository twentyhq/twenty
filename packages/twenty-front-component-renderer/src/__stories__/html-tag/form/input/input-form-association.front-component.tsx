import { useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import { HOST_FORM_ASSOCIATION_TARGET_ID } from './host-form-association-target-id';

type FormAssociationInput = HTMLInputElement & {
  updateRemoteProperty: (name: string, value: unknown) => void;
};

const InputFormAssociationFrontComponent = () => {
  const inputRef = useRef<FormAssociationInput>(null);
  const [attempt, setAttempt] = useState('idle');

  const requestFormOwner = (attributeName: string) => {
    const input = inputRef.current;

    if (!isDefined(input)) {
      return;
    }

    input.updateRemoteProperty(attributeName, HOST_FORM_ASSOCIATION_TARGET_ID);
    setAttempt(`${attributeName} requested`);
  };

  return (
    <FrontComponentCard title="input:form association">
      <input
        ref={inputRef}
        aria-label="External choice"
        type="checkbox"
        name="guest-choice"
        value="guest-value"
        form={HOST_FORM_ASSOCIATION_TARGET_ID}
        required
      />
      <button type="button" onClick={() => requestFormOwner('FORM')}>
        Send uppercase form owner
      </button>
      <button type="button" onClick={() => requestFormOwner('form')}>
        Send lowercase form owner
      </button>
      <span>Attempt: {attempt}</span>
      <form aria-label="Guest preferences">
        <input
          aria-label="Descendant choice"
          type="checkbox"
          name="descendant-choice"
          value="descendant-value"
          required
        />
      </form>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '680d73f3-8d96-4ee5-931d-c315e7f1e1c6',
  name: 'input-form-association-front-component',
  description: 'External form ownership filtering and descendant validation',
  component: InputFormAssociationFrontComponent,
});
