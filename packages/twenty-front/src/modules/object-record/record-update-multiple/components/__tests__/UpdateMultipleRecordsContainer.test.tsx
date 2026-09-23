import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/primitives/feedback';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { UpdateMultipleRecordsContainer } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsContainer';
import { type UpdateMultipleRecordsFormProps } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsForm';

const mockOpenDialog = jest.fn();

jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({ openDialog: mockOpenDialog }),
}));

jest.mock('@/ui/layout/dialog/components/ConfirmationDialog', () => ({
  ConfirmationDialog: () => null,
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

jest.mock(
  '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsActions',
  () => ({
    useUpdateMultipleRecordsActions: () => ({
      updateRecords: jest.fn(),
      isUpdating: false,
      progress: undefined,
      cancel: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/object-record/record-update-multiple/components/UpdateMultipleRecordsForm',
  () => {
    const {
      FormRichTextFieldInput,
    } = require('@/object-record/record-field/ui/form-types/components/FormRichTextFieldInput');

    return {
      UpdateMultipleRecordsForm: ({
        onChange,
      }: UpdateMultipleRecordsFormProps) => (
        <FormRichTextFieldInput
          label="Body"
          defaultValue={undefined}
          onChange={(value: unknown) => onChange('bodyV2', value)}
          formSubmitsOnModEnter
        />
      ),
    };
  },
);

const store = createStore();

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <Provider store={store}>
      <ToastProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ToastProvider>
    </Provider>
  </I18nProvider>
);

it('asks to confirm the bulk update on Mod+Enter typed in a rich-text field', async () => {
  store.set(
    contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    3,
  );
  render(
    <UpdateMultipleRecordsContainer
      objectNameSingular="company"
      contextStoreInstanceId={MAIN_CONTEXT_STORE_INSTANCE_ID}
    />,
    { wrapper: Wrapper },
  );
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: () => screen.getByRole('textbox'),
  });
  Object.defineProperty(Range.prototype, 'getClientRects', {
    configurable: true,
    value: () => [],
  });
  Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(),
  });

  await userEvent.click(screen.getByRole('textbox'));
  await userEvent.keyboard('Hello{Control>}{Enter}{/Control}');

  expect(mockOpenDialog).toHaveBeenCalledWith(
    'update-multiple-records-confirmation',
  );
});
