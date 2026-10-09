import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { NumberStepper } from 'twenty-ui/components';
import { Button, Field } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const NumberStepperExample = () => {
  const [value, setValue] = useState<number | null>(3);
  const [changes, setChanges] = useState(0);
  const [submissions, setSubmissions] = useState(0);
  const [editableValue, setEditableValue] = useState<number | null>(1234);
  const [editChanges, setEditChanges] = useState(0);

  return (
    <TwentyUiGalleryCard title="NumberStepper">
      <form
        aria-label="Quantity form"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmissions((count) => count + 1);
        }}
      >
        <Field.Root>
          <Field.Label>Quantity</Field.Label>
          <NumberStepper
            name="quantity"
            min={0}
            max={5}
            value={value}
            onValueChange={(nextValue) => {
              setValue(nextValue);
              setChanges((count) => count + 1);
            }}
          />
          <Field.Description>Choose up to five items</Field.Description>
        </Field.Root>
        <NumberStepper
          aria-label="Disabled quantity"
          name="disabledQuantity"
          defaultValue={2}
          disabled
          decrementLabel="Decrease disabled quantity"
          incrementLabel="Increase disabled quantity"
          onValueChange={() => setChanges((count) => count + 1)}
        />
        <NumberStepper
          aria-label="Read-only quantity"
          name="readOnlyQuantity"
          defaultValue={4}
          readOnly
          showButtons={false}
          onValueChange={() => setChanges((count) => count + 1)}
        />
        <Button type="submit">Save quantity</Button>
        <Text role="status" aria-label="Quantity state">
          Value: {value ?? 'empty'}; Changes: {changes}; Submissions:{' '}
          {submissions}
        </Text>
      </form>
      <NumberStepper
        aria-label="Editable amount"
        value={editableValue}
        showButtons={false}
        onValueChange={(nextValue) => {
          setEditableValue(nextValue);
          setEditChanges((count) => count + 1);
        }}
      />
      <Text role="status" aria-label="Editing state">
        Amount: {editableValue ?? 'empty'}; Changes: {editChanges}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'f8132b7b-34ae-428b-bf60-029c7e36924d',
  name: 'twenty-ui-number-stepper',
  description: 'Numeric editing, bounds and form behavior in the sandbox',
  component: NumberStepperExample,
});
