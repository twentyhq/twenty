import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { useRecordCreationFormFieldEscape } from '@/side-panel/pages/record-creation-form/hooks/useRecordCreationFormFieldEscape';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useRef } from 'react';
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
}: {
  onDateEscape?: () => void;
  showDateField?: boolean;
}) => {
  const formFieldsRef = useRef<HTMLDivElement>(null);
  useRecordCreationFormFieldEscape({ formFieldsRef });

  return (
    <>
      <div ref={formFieldsRef}>
        <Field instanceId="name" label="Name" />
        {showDateField && (
          <Field instanceId="date" label="Date" onEscape={onDateEscape} />
        )}
      </div>
      <Field instanceId="outside" label="Outside" />
    </>
  );
};

const renderForm = () => {
  const store = createStore();
  const utils = render(<Form />, {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
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
