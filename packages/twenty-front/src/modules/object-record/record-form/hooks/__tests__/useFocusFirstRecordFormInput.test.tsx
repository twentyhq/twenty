import { useFocusFirstRecordFormInput } from '@/object-record/record-form/hooks/useFocusFirstRecordFormInput';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const Form = ({ requestId = 'creation', contentEditable = false }) => {
  const { formFieldsRef } = useFocusFirstRecordFormInput(requestId);

  return (
    <div ref={formFieldsRef}>
      <input aria-label="Read only" readOnly />
      <input aria-label="Disabled" disabled />
      {contentEditable ? (
        <div role="textbox" aria-label="First name" contentEditable />
      ) : (
        <input aria-label="First name" />
      )}
      <input aria-label="Last name" />
    </div>
  );
};

it.each([false, true])(
  'focuses the first editable field so typing works without a click (contentEditable: %s)',
  async (contentEditable) => {
    render(<Form contentEditable={contentEditable} />);
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

it('does not steal focus on rerender, but focuses a new creation request', async () => {
  const { rerender } = render(<Form />);
  const firstName = screen.getByRole('textbox', { name: 'First name' });
  const lastName = screen.getByRole('textbox', { name: 'Last name' });
  await waitFor(() => expect(firstName).toHaveFocus());
  await userEvent.click(lastName);
  rerender(<Form />);
  expect(lastName).toHaveFocus();
  rerender(<Form requestId="next-creation" />);
  await waitFor(() => expect(firstName).toHaveFocus());
});
