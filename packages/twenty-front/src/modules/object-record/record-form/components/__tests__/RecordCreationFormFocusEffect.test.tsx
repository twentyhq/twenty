import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { RecordCreationFormFocusEffect } from '@/object-record/record-form/components/RecordCreationFormFocusEffect';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode, useRef } from 'react';

const OPTIONS = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
];

const Form = ({
  requestId = 'creation',
  fieldCount = 1,
  children,
}: {
  requestId?: string;
  fieldCount?: number;
  children: ReactNode;
}) => {
  const formFieldsRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={formFieldsRef}>
      <RecordCreationFormFocusEffect
        requestId={requestId}
        fieldCount={fieldCount}
        formFieldsRef={formFieldsRef}
      />
      {children}
    </div>
  );
};

const FieldWrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <Provider store={createStore()}>{children}</Provider>
  </I18nProvider>
);

const NameFields = ({ contentEditable = false }) => (
  <>
    <input aria-label="Read only" readOnly />
    <input aria-label="Disabled" disabled />
    {contentEditable ? (
      <div role="textbox" aria-label="First name" contentEditable />
    ) : (
      <input aria-label="First name" />
    )}
    <input aria-label="Last name" />
  </>
);

it.each([false, true])(
  'focuses the first editable field so typing works without a click (contentEditable: %s)',
  async (contentEditable) => {
    render(
      <Form>
        <NameFields contentEditable={contentEditable} />
      </Form>,
    );
    const firstName = screen.getByRole('textbox', { name: 'First name' });
    await waitFor(() => expect(firstName).toHaveFocus());

    await userEvent.keyboard('Maggie');

    if (contentEditable) {
      expect(firstName).toHaveTextContent('Maggie');
    } else {
      expect(firstName).toHaveValue('Maggie');
    }
  },
);

it('focuses a leading select trigger instead of skipping to a later field', async () => {
  render(
    <Form>
      <FormSelectFieldInput
        label="Stage"
        defaultValue="a"
        onChange={jest.fn()}
        options={OPTIONS}
      />
      <input aria-label="Name" />
    </Form>,
    { wrapper: FieldWrapper },
  );

  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Option A' })).toHaveFocus(),
  );
});

it('focuses a leading multi-select button', async () => {
  render(
    <Form>
      <FormMultiSelectFieldInput
        label="Tags"
        defaultValue={[]}
        onChange={jest.fn()}
        options={OPTIONS}
      />
      <input aria-label="Name" />
    </Form>,
    { wrapper: FieldWrapper },
  );

  await waitFor(() =>
    expect(screen.getByRole('button', { name: /Tags/ })).toHaveFocus(),
  );
});

it('focuses fields that render after the form opened', async () => {
  const { rerender } = render(<Form fieldCount={0}>{null}</Form>);
  await new Promise(requestAnimationFrame);

  rerender(
    <Form fieldCount={2}>
      <NameFields />
    </Form>,
  );

  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'First name' })).toHaveFocus(),
  );
});

it('does not steal focus on rerender, but focuses a new creation request', async () => {
  const { rerender } = render(
    <Form>
      <NameFields />
    </Form>,
  );
  const firstName = screen.getByRole('textbox', { name: 'First name' });
  const lastName = screen.getByRole('textbox', { name: 'Last name' });
  await waitFor(() => expect(firstName).toHaveFocus());
  await userEvent.click(lastName);

  rerender(
    <Form fieldCount={2}>
      <NameFields />
    </Form>,
  );
  await new Promise(requestAnimationFrame);
  expect(lastName).toHaveFocus();

  rerender(
    <Form requestId="next-creation" fieldCount={2}>
      <NameFields />
    </Form>,
  );
  await waitFor(() => expect(firstName).toHaveFocus());
});
