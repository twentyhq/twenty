import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Field,
  Input,
  InputGroup,
  InputHint,
  InputLabel,
  Textarea,
} from 'twenty-ui/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const FieldControls = () => {
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [reportedValues, setReportedValues] = useState('');

  return (
    <TwentyUiGalleryCard title="Field and text controls">
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <InputGroup startElement="@" endElement=".com">
          <Input value={email} onValueChange={setEmail} />
        </InputGroup>
        <Field.Description>Use your work email</Field.Description>
      </Field.Root>
      <Field.Root invalid>
        <Field.Label>Required name</Field.Label>
        <Field.Control defaultValue="" />
        <Field.Error match>Name is required</Field.Error>
      </Field.Root>
      <Field.Root>
        <Field.Label>Notes</Field.Label>
        <Textarea value={notes} onValueChange={setNotes} rows={2} />
      </Field.Root>
      <InputLabel htmlFor="legacy-reference">Reference</InputLabel>
      <Input id="legacy-reference" value="REF-42" readOnly />
      <InputHint>Keep this reference</InputHint>
      <InputHint danger>Reference cannot be changed</InputHint>
      <Input aria-label="Disabled input" disabled value="Locked" />
      <p role="status">
        Email: {email}; Notes: {notes}
      </p>
      <button
        onClick={() => setReportedValues(`Email: ${email}; Notes: ${notes}`)}
      >
        Read values
      </button>
      <p data-testid="reported-values">{reportedValues}</p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840001',
  name: 'twenty-ui-field-controls',
  description:
    'Field, Input, InputGroup, Textarea and legacy input helpers in the sandbox',
  component: FieldControls,
});
