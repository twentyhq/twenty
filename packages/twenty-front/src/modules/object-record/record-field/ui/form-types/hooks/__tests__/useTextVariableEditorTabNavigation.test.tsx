import { FormFullNameFieldInput } from '@/object-record/record-field/ui/form-types/components/FormFullNameFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useTextVariableEditor } from '@/object-record/record-field/ui/form-types/hooks/useTextVariableEditor';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorContent } from '@tiptap/react';

const EditorField = ({ label }: { label: string }) => {
  const editor = useTextVariableEditor({
    placeholder: label,
    multiline: false,
    readonly: false,
    defaultValue: undefined,
    onUpdate: () => {},
  });
  return (
    <section aria-label={label}>
      <EditorContent editor={editor} />
    </section>
  );
};

it('tabs between editable text fields in both directions', async () => {
  render(
    <>
      <button>Before</button>
      <EditorField label="First name" />
      <EditorField label="Last name" />
      <input aria-label="Email" />
    </>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Before' }));
  await userEvent.tab();
  expect(screen.getByRole('region', { name: 'First name' })).toContainElement(
    document.activeElement,
  );
  await userEvent.tab();
  expect(screen.getByRole('region', { name: 'Last name' })).toContainElement(
    document.activeElement,
  );
  await userEvent.tab();
  expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  await userEvent.tab({ shift: true });
  expect(screen.getByRole('region', { name: 'Last name' })).toContainElement(
    document.activeElement,
  );
});

it('tabs through the actual nested name fields and into the next form field', async () => {
  render(
    <>
      <button>Before</button>
      <FormFullNameFieldInput
        label="Name"
        defaultValue={undefined}
        onChange={() => {}}
      />
      <FormTextFieldInput
        label="Email"
        defaultValue={undefined}
        onChange={() => {}}
      />
      <button>Submit</button>
    </>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Before' }));
  await userEvent.tab();
  const firstName = document.activeElement;
  expect(firstName).toHaveAttribute('contenteditable', 'true');
  await userEvent.tab();
  expect(document.activeElement).not.toBe(firstName);
  expect(document.activeElement).toHaveAttribute('contenteditable', 'true');
  await userEvent.tab();
  expect(document.activeElement).toHaveAttribute('contenteditable', 'true');
  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
});
