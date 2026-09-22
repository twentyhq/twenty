import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormUuidFieldInput } from '@/object-record/record-field/ui/form-types/components/FormUuidFieldInput';
import { useRecordCreationFormFieldEscape } from '@/side-panel/pages/record-creation-form/hooks/useRecordCreationFormFieldEscape';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode, useRef } from 'react';
import { Key } from 'ts-key-enum';

const mockHandleSidePanelEscape = jest.fn();

jest.mock('@/side-panel/hooks/useHandleSidePanelEscape', () => ({
  useHandleSidePanelEscape: () => mockHandleSidePanelEscape,
}));

const Field = ({
  instanceId,
  label,
  onEscape,
}: {
  instanceId: string;
  label: string;
  onEscape?: () => void;
}) => {
  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => onEscape?.(),
    focusId: instanceId,
    dependencies: [onEscape],
    options: { preventDefault: onEscape !== undefined },
  });

  return (
    <FormFieldInputInnerContainer
      formFieldInputInstanceId={instanceId}
      hasRightElement={false}
    >
      <input aria-label={label} />
    </FormFieldInputInnerContainer>
  );
};

const Form = ({
  onDateEscape,
  showDateField = false,
  firstField,
}: {
  onDateEscape?: () => void;
  showDateField?: boolean;
  firstField?: ReactNode;
}) => {
  const formFieldsRef = useRef<HTMLDivElement>(null);
  useRecordCreationFormFieldEscape({ formFieldsRef });

  return (
    <>
      <div ref={formFieldsRef}>
        {firstField}
        <Field instanceId="name" label="Name" />
        {showDateField && (
          <Field instanceId="date" label="Date" onEscape={onDateEscape} />
        )}
      </div>
      <Field instanceId="outside" label="Outside" />
    </>
  );
};

const renderForm = (firstField?: ReactNode) => {
  const store = createStore();
  const utils = render(<Form firstField={firstField} />, {
    wrapper: ({ children }) => (
      <I18nProvider i18n={i18n}>
        <Provider store={store}>{children}</Provider>
      </I18nProvider>
    ),
  });

  return utils;
};

beforeEach(() => jest.clearAllMocks());

it('leaves the creation form when Escape is pressed in a focused field', async () => {
  renderForm();
  const name = screen.getByRole('textbox', { name: 'Name' });
  await userEvent.click(name);

  await userEvent.keyboard('{Escape}');

  await waitFor(() =>
    expect(mockHandleSidePanelEscape).toHaveBeenCalledTimes(1),
  );
  expect(name).not.toHaveFocus();
});

it('lets a field that handles Escape itself keep the form open, even when its listener is bound later', async () => {
  const onDateEscape = jest.fn();
  const { rerender } = renderForm();
  rerender(<Form showDateField onDateEscape={onDateEscape} />);
  await userEvent.click(screen.getByRole('textbox', { name: 'Date' }));

  await userEvent.keyboard('{Escape}');

  expect(onDateEscape).toHaveBeenCalledTimes(1);
  await new Promise((resolve) => setTimeout(resolve));
  expect(mockHandleSidePanelEscape).not.toHaveBeenCalled();
});

it('ignores Escape in fields outside the creation form', async () => {
  renderForm();
  await userEvent.click(screen.getByRole('textbox', { name: 'Outside' }));

  await userEvent.keyboard('{Escape}');

  await new Promise((resolve) => setTimeout(resolve));
  expect(mockHandleSidePanelEscape).not.toHaveBeenCalled();
});

it.each([
  [
    'Enter a number',
    <FormNumberFieldInput
      key="number"
      label="Employees"
      defaultValue={undefined}
      onChange={jest.fn()}
    />,
  ],
  [
    'Enter a UUID',
    <FormUuidFieldInput
      key="uuid"
      label="External id"
      defaultValue={undefined}
      onChange={jest.fn()}
    />,
  ],
  [
    'Enter an item',
    <FormArrayFieldInput
      key="array"
      label="Tags"
      defaultValue={[]}
      onChange={jest.fn()}
    />,
  ],
])(
  'leaves the creation form when Escape is pressed in the "%s" field',
  async (placeholder, firstField) => {
    renderForm(firstField);
    const input = screen.getByPlaceholderText(placeholder);
    await userEvent.click(input);

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(mockHandleSidePanelEscape).toHaveBeenCalledTimes(1),
    );
    expect(input).not.toHaveFocus();
  },
);

it('closes only the open select dropdown when Escape is pressed in it', async () => {
  renderForm(
    <FormSelectFieldInput
      label="Stage"
      defaultValue="a"
      onChange={jest.fn()}
      options={[
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ]}
    />,
  );
  await userEvent.click(screen.getByText('Option A'));
  expect(await screen.findByText('Option B')).toBeInTheDocument();

  await userEvent.keyboard('{Escape}');

  await waitFor(() =>
    expect(screen.queryByText('Option B')).not.toBeInTheDocument(),
  );
  await new Promise((resolve) => setTimeout(resolve));
  expect(mockHandleSidePanelEscape).not.toHaveBeenCalled();
});
