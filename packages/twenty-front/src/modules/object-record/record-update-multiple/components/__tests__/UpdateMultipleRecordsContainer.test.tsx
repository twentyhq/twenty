import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type createElement, type Fragment, type ReactNode } from 'react';

import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { UpdateMultipleRecordsContainer } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsContainer';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FieldMetadataType } from 'twenty-shared/types';

const CONTEXT_STORE_INSTANCE_ID = 'bulk-update-context';
const AMOUNT_FIELD = {
  id: 'field-amount',
  name: 'amount',
  label: 'Amount',
  type: FieldMetadataType.CURRENCY,
  isActive: true,
  isSystem: false,
  isUIEditable: true,
};

const OPPORTUNITY_OBJECT = {
  id: 'opportunity-object',
  nameSingular: 'opportunity',
  fields: [AMOUNT_FIELD],
};

const mockOpenDialog = jest.fn();
const mockUpdateRecords = jest.fn();
const mockCancel = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockEnqueueToast = jest.fn();
const scrollIntoView = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: OPPORTUNITY_OBJECT }),
}));

jest.mock(
  '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsActions',
  () => ({
    useUpdateMultipleRecordsActions: () => ({
      updateRecords: mockUpdateRecords,
      isUpdating: false,
      progress: undefined,
      cancel: mockCancel,
    }),
  }),
);

jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({ openDialog: mockOpenDialog }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/ui/layout/dialog/components/ConfirmationDialog', () => ({
  ConfirmationDialog: () => null,
}));

type MockUpdateMultipleRecordsFormProps = {
  values: Record<string, unknown>;
  onChange: (fieldName: string, value: string) => void;
  formInstanceId: string;
};

type WrapperProps = {
  children: ReactNode;
};

jest.mock(
  '@/object-record/record-update-multiple/components/UpdateMultipleRecordsForm',
  () => {
    const ReactForMock: {
      createElement: typeof createElement;
      Fragment: typeof Fragment;
    } = require('react');
    const jotaiStoreModuleForMock = require('@/ui/utilities/state/jotai/jotaiStore');
    const {
      recordFieldInputIsFieldInErrorComponentState: errorStateForMock,
    } = require('@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState');
    const {
      getRecordFormFieldInputInstanceId: getInstanceIdForMock,
    } = require('@/object-record/record-form/utils/getRecordFormFieldInputInstanceId');
    const { isString: isStringForMock } = require('@sniptt/guards');

    return {
      UpdateMultipleRecordsForm: ({
        values,
        onChange,
        formInstanceId,
      }: MockUpdateMultipleRecordsFormProps) => {
        const isInvalid = values.amount === 'invalid';

        return ReactForMock.createElement(
          ReactForMock.Fragment,
          null,
          ReactForMock.createElement('input', {
            'aria-label': 'Amount',
            value: isStringForMock(values.amount) ? values.amount : '',
            onChange: (event: { target: { value: string } }) => {
              onChange('amount', event.target.value);
              jotaiStoreModuleForMock.jotaiStore.set(
                errorStateForMock.atomFamily({
                  instanceId: getInstanceIdForMock({
                    formInstanceId,
                    fieldMetadataId: AMOUNT_FIELD.id,
                  }),
                }),
                event.target.value === 'invalid',
              );
            },
          }),
          isInvalid
            ? ReactForMock.createElement(
                'div',
                { role: 'alert' },
                'Invalid number',
              )
            : null,
        );
      },
    };
  },
);

const Wrapper = ({ children }: WrapperProps) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

const renderContainer = () =>
  render(
    <UpdateMultipleRecordsContainer
      objectNameSingular="opportunity"
      contextStoreInstanceId={CONTEXT_STORE_INSTANCE_ID}
    />,
    { wrapper: Wrapper },
  );

describe('UpdateMultipleRecordsContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Element.prototype.scrollIntoView = scrollIntoView;
    resetJotaiStore();
    jotaiStore.set(
      contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
        instanceId: CONTEXT_STORE_INSTANCE_ID,
      }),
      3,
    );
  });

  it('does not open the confirmation dialog when a field input reports a validation error', async () => {
    const user = userEvent.setup();

    renderContainer();

    await user.type(screen.getByLabelText('Amount'), 'invalid');
    await user.click(screen.getByRole('button', { name: /Apply changes/i }));

    expect(mockOpenDialog).not.toHaveBeenCalled();
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));

    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '12');
    await user.click(screen.getByRole('button', { name: /Apply changes/i }));

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    expect(mockOpenDialog).toHaveBeenCalledWith(
      'update-multiple-records-confirmation',
    );
  });
});
