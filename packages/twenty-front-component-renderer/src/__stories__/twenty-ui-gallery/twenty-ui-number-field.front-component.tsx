import { createElement, useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Button, Field, NumberField } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const NumberFieldExample = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<number | null>(12.5);
  const [changeDetails, setChangeDetails] = useState('none');
  const [commitDetails, setCommitDetails] = useState('none');
  const [quantityDetails, setQuantityDetails] = useState('none');
  const [refTargets, setRefTargets] = useState('');
  const [scrubDetails, setScrubDetails] = useState('none');

  return (
    <TwentyUiGalleryCard title="NumberField">
      <form aria-label="Amount form">
        <Field.Root>
          <Field.Label>Localized amount</Field.Label>
          <NumberField.Root
            ref={rootRef}
            inputRef={nativeInputRef}
            name="amount"
            locale="de-DE"
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            value={value}
            step={0.25}
            smallStep={0.05}
            largeStep={5}
            onValueChange={(nextValue, details) => {
              setValue(nextValue);
              setChangeDetails(
                `${details.reason}/${details.event.type}/${typeof details.cancel}`,
              );
            }}
            onValueCommitted={(nextValue, details) =>
              setCommitDetails(
                `${nextValue ?? 'empty'}/${details.reason}/${details.event.type}`,
              )
            }
            render={(props, state) =>
              createElement('div', {
                ...props,
                'data-testid': 'amount-root',
                'data-value': state.value ?? 'empty',
              })
            }
          >
            <NumberField.Group
              render={<section aria-label="Amount controls" />}
            >
              <NumberField.Decrement
                aria-label="Decrease amount"
                render={<Button />}
              >
                Decrease amount
              </NumberField.Decrement>
              <NumberField.Input
                ref={inputRef}
                render={(props, state) =>
                  createElement('input', {
                    ...props,
                    'data-testid': 'amount-input',
                    'data-value': state.value ?? 'empty',
                  })
                }
              />
              <NumberField.Increment
                aria-label="Increase amount"
                render={<Button />}
              >
                Increase amount
              </NumberField.Increment>
            </NumberField.Group>
          </NumberField.Root>
          <Field.Description>
            Enter an amount using a decimal comma
          </Field.Description>
        </Field.Root>
      </form>
      <Text role="status" aria-label="Amount state">
        Value: {value ?? 'empty'}; Change: {changeDetails}; Commit:{' '}
        {commitDetails}
      </Text>
      <Button
        onClick={() => {
          setRefTargets(
            `${rootRef.current?.tagName}/${inputRef.current?.tagName}:${inputRef.current?.type}/${nativeInputRef.current?.tagName}:${nativeInputRef.current?.type}/${nativeInputRef.current?.value}`,
          );
        }}
      >
        Inspect amount refs
      </Button>
      <Text role="status" aria-label="Amount ref targets">
        {refTargets}
      </Text>
      <Field.Root>
        <Field.Label>Uncontrolled quantity</Field.Label>
        <NumberField.Root
          defaultValue={2}
          min={0}
          max={4}
          step={2}
          onValueChange={(nextValue, details) =>
            setQuantityDetails(
              `${nextValue ?? 'empty'}/${details.reason}/${details.event.type}`,
            )
          }
        >
          <NumberField.Group>
            <NumberField.Decrement aria-label="Decrease uncontrolled quantity" />
            <NumberField.Input />
            <NumberField.Increment aria-label="Increase uncontrolled quantity" />
          </NumberField.Group>
        </NumberField.Root>
      </Field.Root>
      <Text role="status" aria-label="Quantity details">
        {quantityDetails}
      </Text>
      <NumberField.Root defaultValue={6} disabled>
        <NumberField.Group>
          <NumberField.Input aria-label="Disabled number field" />
          <NumberField.Increment aria-label="Increase disabled number field" />
        </NumberField.Group>
      </NumberField.Root>
      <Field.Root>
        <NumberField.Root
          defaultValue={10}
          onValueChange={(nextValue, details) =>
            setScrubDetails(`${nextValue}/${details.reason}`)
          }
          onValueCommitted={(nextValue, details) =>
            setScrubDetails(`${nextValue}/${details.reason}/committed`)
          }
        >
          <NumberField.ScrubArea data-testid="number-scrub-area">
            <Field.Label>Scrubbable quantity</Field.Label>
            <NumberField.ScrubAreaCursor>
              <span aria-hidden>↔</span>
            </NumberField.ScrubAreaCursor>
          </NumberField.ScrubArea>
          <NumberField.Input />
        </NumberField.Root>
      </Field.Root>
      <Text role="status" aria-label="Scrub state">
        {scrubDetails}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '1c9fdf30-13df-4d27-ae69-fdadcf952758',
  name: 'twenty-ui-number-field',
  description: 'Compound numeric controls, locale formatting and native refs',
  component: NumberFieldExample,
});
