import { FormFieldEscapeContext } from '@/object-record/record-field/ui/contexts/FormFieldEscapeContext';
import { FormArrayFieldInput } from '@/object-record/record-field/ui/form-types/components/FormArrayFieldInput';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { FormUuidFieldInput } from '@/object-record/record-field/ui/form-types/components/FormUuidFieldInput';
import { useCommandMenuHotKeys } from '@/command-menu/hooks/useCommandMenuHotKeys';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useRecordCreationFormFieldEscape } from '@/side-panel/pages/record-creation-form/hooks/useRecordCreationFormFieldEscape';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

const mockHandleSidePanelEscape = jest.fn();

jest.mock('@/side-panel/hooks/useHandleSidePanelEscape', () => ({
  useHandleSidePanelEscape: () => mockHandleSidePanelEscape,
}));
jest.mock('@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu', () => ({
  useKeyboardShortcutMenu: () => ({ closeKeyboardShortcutMenu: jest.fn() }),
}));
jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ toggleSidePanelMenu: jest.fn() }),
}));
jest.mock('@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel', () => ({
  useOpenRecordsSearchPageInSidePanel: () => ({
    openRecordsSearchPage: jest.fn(),
  }),
}));
jest.mock('@/side-panel/hooks/useOpenAskAiPageInSidePanel', () => ({
  useOpenAskAiPageInSidePanel: () => ({ openAskAiPage: jest.fn() }),
}));
jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: () => ({ record: undefined }),
}));

// The app layout always binds the side panel's own Escape hotkey
const SidePanelHotkeysEffect = () => {
  useCommandMenuHotKeys();
  return null;
};

const Form = ({ children }: { children: ReactNode }) => {
  const handleFieldEscape = useRecordCreationFormFieldEscape();

  return (
    <FormFieldEscapeContext.Provider value={handleFieldEscape}>
      {children}
    </FormFieldEscapeContext.Provider>
  );
};

const renderForm = (field: ReactNode, outsideField?: ReactNode) => {
  const store = createStore();
  store.set(focusStackState.atom, [
    {
      focusId: SIDE_PANEL_FOCUS_ID,
      componentInstance: {
        componentType: FocusComponentType.SIDE_PANEL,
        componentInstanceId: SIDE_PANEL_FOCUS_ID,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    },
  ]);

  return render(
    <>
      <Form>{field}</Form>
      {outsideField}
    </>,
    {
      wrapper: ({ children }) => (
        <I18nProvider i18n={i18n}>
          <Provider store={store}>
            <SidePanelHotkeysEffect />
            {children}
          </Provider>
        </I18nProvider>
      ),
    },
  );
};

beforeEach(() => jest.clearAllMocks());

it('ignores Escape in a field outside the creation form', async () => {
  renderForm(
    null,
    <FormNumberFieldInput
      label="Outside"
      defaultValue={undefined}
      onChange={jest.fn()}
    />,
  );
  await userEvent.click(screen.getByPlaceholderText('Enter a number'));

  await userEvent.keyboard('{Escape}');

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

it('leaves the creation form when Escape is pressed in a text editor field', async () => {
  const { container } = renderForm(
    <FormTextFieldInput
      label="Company name"
      defaultValue={undefined}
      onChange={jest.fn()}
    />,
  );
  const editor = container.querySelector<HTMLElement>(
    '[contenteditable="true"]',
  );
  if (!isDefined(editor)) {
    throw new Error('Text editor not rendered');
  }
  act(() => editor.focus());

  fireEvent.keyDown(editor, { key: 'Escape', code: 'Escape', keyCode: 27 });

  await waitFor(() =>
    expect(mockHandleSidePanelEscape).toHaveBeenCalledTimes(1),
  );
});

it('leaves the creation form from a date field once its picker is closed', async () => {
  const user = userEvent.setup();
  renderForm(
    <FormDateFieldInput
      label="Close date"
      defaultValue={undefined}
      onChange={jest.fn()}
    />,
  );
  await user.click(screen.getAllByRole('textbox')[0]);

  await user.keyboard('{Escape}');
  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(mockHandleSidePanelEscape).toHaveBeenCalledTimes(1),
  );
});

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

const SELECT_OPTIONS = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
];

it.each([
  [
    'select',
    <FormSelectFieldInput
      key="select"
      label="Stage"
      defaultValue="a"
      onChange={jest.fn()}
      options={SELECT_OPTIONS}
    />,
  ],
  [
    'multi-select',
    <FormMultiSelectFieldInput
      key="multi-select"
      label="Tags"
      defaultValue={['a']}
      onChange={jest.fn()}
      options={SELECT_OPTIONS}
    />,
  ],
  [
    'relation',
    <FormSingleRecordPicker
      key="relation"
      label="Company"
      defaultValue={undefined}
      onChange={jest.fn()}
      objectNameSingulars={['company']}
    />,
  ],
  [
    'array',
    <FormArrayFieldInput
      key="array"
      label="Tags"
      defaultValue={['First item']}
      onChange={jest.fn()}
    />,
  ],
])(
  'leaves the creation form once when Escape is pressed on a focused closed %s trigger',
  async (_triggerType, firstField) => {
    const user = userEvent.setup();
    renderForm(firstField);
    await user.tab();
    expect(document.activeElement).not.toBe(document.body);

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(mockHandleSidePanelEscape).toHaveBeenCalledTimes(1),
    );
    await new Promise((resolve) => setTimeout(resolve));
    expect(mockHandleSidePanelEscape).toHaveBeenCalledTimes(1);
  },
);

it.each([
  [
    'select',
    'Option B',
    <FormSelectFieldInput
      key="select"
      label="Stage"
      defaultValue="a"
      onChange={jest.fn()}
      options={SELECT_OPTIONS}
    />,
  ],
  [
    'array',
    'Add item',
    <FormArrayFieldInput
      key="array"
      label="Tags"
      defaultValue={['First item']}
      onChange={jest.fn()}
    />,
  ],
])(
  'closes an open %s dropdown first, then leaves the creation form from its trigger',
  async (_triggerType, dropdownText, firstField) => {
    const user = userEvent.setup();
    renderForm(firstField);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(await screen.findByText(dropdownText)).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByText(dropdownText)).not.toBeInTheDocument(),
    );
    await new Promise((resolve) => setTimeout(resolve));
    expect(mockHandleSidePanelEscape).not.toHaveBeenCalled();

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(mockHandleSidePanelEscape).toHaveBeenCalledTimes(1),
    );
  },
);

it('closes an open multi-select list first, then leaves the creation form', async () => {
  const user = userEvent.setup();
  renderForm(
    <FormMultiSelectFieldInput
      label="Tags"
      defaultValue={['a']}
      onChange={jest.fn()}
      options={SELECT_OPTIONS}
    />,
  );
  await user.click(screen.getByText('Option A'));
  expect(await screen.findByText('Option B')).toBeInTheDocument();

  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(screen.queryByText('Option B')).not.toBeInTheDocument(),
  );
  expect(mockHandleSidePanelEscape).not.toHaveBeenCalled();

  await user.keyboard('{Escape}');

  await waitFor(() =>
    expect(mockHandleSidePanelEscape).toHaveBeenCalledTimes(1),
  );
});
