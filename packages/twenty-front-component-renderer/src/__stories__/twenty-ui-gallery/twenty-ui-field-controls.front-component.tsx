import { createElement, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Button,
  Field,
  Input,
  InputGroup,
  Radio,
  RadioGroup,
  Textarea,
} from 'twenty-ui/primitives/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const FieldControls = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [nativeTarget, setNativeTarget] = useState('');
  const [controlValues, setControlValues] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [reportedValues, setReportedValues] = useState('');

  return (
    <TwentyUiGalleryCard title="Field and text controls">
      <Field.Root name="notifications">
        <Field.Label>Notifications</Field.Label>
        <RadioGroup defaultValue="important">
          <Field.Item>
            <Field.Label>Important updates</Field.Label>
            <Radio value="important" />
            <Field.Description>Only urgent messages</Field.Description>
          </Field.Item>
          <Field.Item>
            <Field.Label>All updates</Field.Label>
            <Radio value="all" />
            <Field.Description>Every record change</Field.Description>
          </Field.Item>
          <Field.Item disabled>
            <Field.Label>Daily digest</Field.Label>
            <Radio value="digest" />
          </Field.Item>
        </RadioGroup>
      </Field.Root>
      <Field.Root>
        <Field.Label>Email</Field.Label>
        <InputGroup
          size="sm"
          startElement="@"
          endElement=".com"
          aria-label="Email layout"
        >
          <Input
            ref={inputRef}
            size="md"
            value={email}
            onValueChange={setEmail}
          />
        </InputGroup>
        <Field.Description>Use your work email</Field.Description>
      </Field.Root>
      <Field.Root invalid>
        <Field.Label>Required name</Field.Label>
        <Field.Control defaultValue="" />
        <Field.Error match>Name is required</Field.Error>
      </Field.Root>
      <Field.Root invalid>
        <Field.Label>Notes</Field.Label>
        <p id="notes-help">Additional guidance</p>
        <Textarea
          ref={textareaRef}
          aria-describedby="notes-help"
          value={notes}
          onValueChange={setNotes}
          onChange={(event) => setNativeTarget(event.currentTarget.tagName)}
          rows={1}
          autoResize
          maxRows={6}
          render={(props, state) =>
            createElement('textarea', {
              ...props,
              'data-filled': state.filled || undefined,
            })
          }
        />
        <Field.Description>Team context</Field.Description>
        <Field.Error match>Notes need review</Field.Error>
      </Field.Root>
      <Field.Root invalid>
        <Field.Label>Reference</Field.Label>
        <Input value="REF-42" readOnly />
        <Field.Description>Keep this reference</Field.Description>
        <Field.Error match>Reference cannot be changed</Field.Error>
      </Field.Root>
      <Input aria-label="Disabled input" disabled value="Locked" />
      <p role="status">
        Email: {email}; Notes: {notes}
      </p>
      <Button type="button" onClick={() => setNotes('First\nSecond\nThird')}>
        Apply notes
      </Button>
      <Button type="button" onClick={() => setNotes('')}>
        Clear notes
      </Button>
      <p data-testid="native-target">{nativeTarget}</p>
      <p data-testid="control-values">{controlValues}</p>
      <Button
        type="button"
        onClick={() => {
          setReportedValues(`Email: ${email}; Notes: ${notes}`);
          setControlValues(
            `${inputRef.current?.value}/${textareaRef.current?.value}`,
          );
        }}
      >
        Read values
      </Button>
      <p data-testid="reported-values">{reportedValues}</p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840001',
  name: 'twenty-ui-field-controls',
  description:
    'Field, Input, InputGroup, Textarea and validation in the sandbox',
  component: FieldControls,
});
