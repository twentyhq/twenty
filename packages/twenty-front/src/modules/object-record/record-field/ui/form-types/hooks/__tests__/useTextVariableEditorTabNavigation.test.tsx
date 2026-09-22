import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
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

it.each([false, true])(
  'preserves custom inline-edit Tab navigation (shift: %s)',
  async (shift) => {
    const user = userEvent.setup();
    const onNavigate = jest.fn();
    render(
      <>
        <button>Before</button>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId="custom-input"
          hasRightElement={false}
        >
          <TextInput
            instanceId="custom-input"
            value="Draft"
            copyButton={false}
            onTab={shift ? undefined : onNavigate}
            onShiftTab={shift ? onNavigate : undefined}
            isNativeTabNavigationEnabled
          />
        </FormFieldInputInnerContainer>
        <button>After</button>
      </>,
    );
    const input = screen.getByDisplayValue('Draft');
    await user.click(input);
    await user.tab({ shift });
    expect(onNavigate).toHaveBeenCalledWith('Draft');
    expect(input).toHaveFocus();
    await user.tab({ shift: !shift });
    expect(
      screen.getByRole('button', { name: shift ? 'After' : 'Before' }),
    ).toHaveFocus();
  },
);

it.each([false, true])(
  'keeps Tab inside inputs that do not opt into native navigation (shift: %s)',
  async (shift) => {
    const user = userEvent.setup();
    render(
      <>
        <button>Before</button>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId="cell-input"
          hasRightElement={false}
        >
          <TextInput instanceId="cell-input" value="Draft" copyButton={false} />
        </FormFieldInputInnerContainer>
        <button>After</button>
      </>,
    );
    const input = screen.getByDisplayValue('Draft');
    await user.click(input);
    await user.tab({ shift });
    expect(input).toHaveFocus();
  },
);
