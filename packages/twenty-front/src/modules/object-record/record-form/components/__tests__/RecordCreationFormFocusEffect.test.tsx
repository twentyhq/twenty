import { RecordCreationFormFocusEffect } from '@/object-record/record-form/components/RecordCreationFormFocusEffect';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useRef } from 'react';

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
      <div role="combobox" aria-label="Stage" tabIndex={0} />
      <input aria-label="Name" />
    </Form>,
  );

  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Stage' })).toHaveFocus(),
  );
});

it('focuses a leading multi-select button', async () => {
  render(
    <Form>
      <button type="button">Tags</button>
      <input aria-label="Name" />
    </Form>,
  );

  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Tags' })).toHaveFocus(),
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
