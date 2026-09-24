import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormLinksFieldInput } from '@/object-record/record-field/ui/form-types/components/FormLinksFieldInput';
import { FormFullNameFieldInput } from '@/object-record/record-field/ui/form-types/components/FormFullNameFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useTextVariableEditor } from '@/object-record/record-field/ui/form-types/hooks/useTextVariableEditor';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorContent } from '@tiptap/react';
import { type ReactNode } from 'react';

const I18nWrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

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
  expect(
    screen
      .getByRole('region', { name: 'First name' })
      .contains(document.activeElement),
  ).toBe(true);
  await userEvent.tab();
  expect(
    screen
      .getByRole('region', { name: 'Last name' })
      .contains(document.activeElement),
  ).toBe(true);
  await userEvent.tab();
  expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  await userEvent.tab({ shift: true });
  expect(
    screen
      .getByRole('region', { name: 'Last name' })
      .contains(document.activeElement),
  ).toBe(true);
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

it('tabs between number inputs used in workflow nodes in both directions', async () => {
  const user = userEvent.setup();
  render(
    <>
      <FormNumberFieldInput defaultValue={1} onChange={() => {}} />
      <FormNumberFieldInput defaultValue={2} onChange={() => {}} />
      <button>Save</button>
    </>,
  );
  const first = screen.getByDisplayValue('1');
  const second = screen.getByDisplayValue('2');
  await user.click(first);
  await user.tab();
  expect(second).toHaveFocus();
  await user.tab({ shift: true });
  expect(first).toHaveFocus();
  await user.tab();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
});

it('tabs out of an empty array field in both directions', async () => {
  const user = userEvent.setup();
  render(
    <>
      <button>Before</button>
      <FormArrayFieldInput defaultValue={[]} onChange={() => {}} />
      <button>After</button>
    </>,
    { wrapper: I18nWrapper },
  );
  const itemInput = screen.getByPlaceholderText('Enter an item');
  await user.click(itemInput);
  await user.tab();
  expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(itemInput).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
});

it('tabs through a links field and past its empty secondary links', async () => {
  const user = userEvent.setup();
  render(
    <>
      <FormLinksFieldInput
        label="Links"
        defaultValue={undefined}
        onChange={() => {}}
      />
      <button>Next field</button>
    </>,
    { wrapper: I18nWrapper },
  );
  const secondaryLinksInput = screen.getByPlaceholderText('Enter an item');
  await user.click(secondaryLinksInput);
  await user.tab();
  expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(secondaryLinksInput).toHaveFocus();
  await user.tab({ shift: true });
  expect(document.activeElement).toHaveAttribute('contenteditable', 'true');
});
