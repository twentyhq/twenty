import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useState, type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadsheetImportSubmissionError } from '@/spreadsheet-import/errors/SpreadsheetImportSubmissionError';
import { spreadsheetImportDialogState } from '@/spreadsheet-import/states/spreadsheetImportDialogState';
import { ValidationStep } from '@/spreadsheet-import/steps/components/ValidationStep/ValidationStep';
import { type ImportedStructuredRowMetadata } from '@/spreadsheet-import/steps/components/ValidationStep/types';
import { type SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import {
  type ImportedStructuredRow,
  type SpreadsheetImportDialogOptions,
} from '@/spreadsheet-import/types';
import { type SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';

const mockEnqueueToast = jest.fn();
const mockEnqueueDialog = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));
jest.mock('@/ui/feedback/dialog-manager/hooks/useDialogManager', () => ({
  useDialogManager: () => ({ enqueueDialog: mockEnqueueDialog }),
}));
jest.mock('@/spreadsheet-import/components/SpreadsheetImportStepBody', () => ({
  SpreadsheetImportStepBody: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock('@/spreadsheet-import/components/StepNavigationButton', () => ({
  StepNavigationButton: ({ onContinue }: { onContinue: () => void }) => (
    <button onClick={onContinue}>Confirm</button>
  ),
}));
jest.mock(
  '@/spreadsheet-import/steps/components/ValidationStep/components/columns',
  () => ({
    generateColumns: () => [],
  }),
);
jest.mock('@/spreadsheet-import/components/SpreadsheetImportTable', () => ({
  SpreadsheetImportTable: ({
    rows,
    onRowsChange,
  }: {
    rows: (ImportedStructuredRow & ImportedStructuredRowMetadata)[];
    onRowsChange: (
      rows: (ImportedStructuredRow & ImportedStructuredRowMetadata)[],
      changes: { indexes: number[] },
    ) => void;
  }) => (
    <>
      {rows.map((row, index) => (
        <input
          key={row.__index}
          aria-label={`Row ${index + 1}`}
          value={String(row.name)}
          onChange={(event) =>
            onRowsChange(
              rows.map((current, rowIndex) =>
                rowIndex === index
                  ? Object.assign({}, current, { name: event.target.value })
                  : current,
              ),
              { indexes: [index] },
            )
          }
        />
      ))}
    </>
  ),
}));

const importedColumns: SpreadsheetColumns = [
  {
    type: SpreadsheetColumnType.matched,
    value: 'name',
    index: 0,
    header: 'Name',
  },
];
const file = new File(['name\nOriginal'], 'people.csv');

const setup = (
  onSubmit: SpreadsheetImportDialogOptions['onSubmit'],
  initialData: ImportedStructuredRow[] = [{ name: 'Original' }],
) => {
  const store = createStore();
  const onClose = jest.fn();
  const Harness = () => {
    const [step, setStep] = useState<SpreadsheetImportStep>({
      type: SpreadsheetImportStepType.validateData,
      data: initialData,
      importedColumns,
    });
    return (
      <ReactSpreadsheetImportContextProvider
        values={{
          onSubmit,
          onClose,
          availableFieldMetadataItems: [],
          spreadsheetImportFields: [
            {
              key: 'name',
              label: 'Name',
              Icon: null,
              fieldMetadataItemId: 'name',
              fieldMetadataType: FieldMetadataType.TEXT,
              fieldType: { type: 'input' },
              isNestedField: false,
              fieldValidationDefinitions: [
                {
                  rule: 'required',
                  errorMessage: 'Name is required',
                  level: 'error',
                },
              ],
            },
          ],
        }}
      >
        {step.type === SpreadsheetImportStepType.validateData ? (
          <ValidationStep
            initialData={step.data}
            importedColumns={step.importedColumns}
            file={file}
            setCurrentStepState={setStep}
            onBack={jest.fn()}
          />
        ) : (
          <div>Importing</div>
        )}
      </ReactSpreadsheetImportContextProvider>
    );
  };
  render(
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <Harness />
      </I18nProvider>
    </Provider>,
  );
  return { store, onClose, user: userEvent.setup() };
};

describe('ValidationStep submission recovery', () => {
  beforeEach(() => jest.clearAllMocks());

  it('restores edited rows and the step bar after rejection, then closes on a successful retry', async () => {
    let rejectSubmission: (error: Error) => void = () => {};
    const pendingSubmission = new Promise<void>((_resolve, reject) => {
      rejectSubmission = reject;
    });
    const onSubmit = jest
      .fn()
      .mockReturnValueOnce(pendingSubmission)
      .mockResolvedValueOnce(undefined);
    const { user, onClose, store } = setup(onSubmit);
    await user.clear(screen.getByRole('textbox', { name: 'Row 1' }));
    await user.type(screen.getByRole('textbox', { name: 'Row 1' }), 'Edited');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(screen.getByText('Importing')).toBeInTheDocument();
    expect(store.get(spreadsheetImportDialogState.atom).isStepBarVisible).toBe(
      false,
    );
    await act(async () => rejectSubmission(new Error('Import failed')));
    await waitFor(() => expect(mockEnqueueToast).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Row 1' })).toHaveValue(
      'Edited',
    );
    expect(store.get(spreadsheetImportDialogState.atom).isStepBarVisible).toBe(
      true,
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[1][0].validStructuredRows).toEqual([
      { name: 'Edited' },
    ]);
    expect(onSubmit.mock.calls[1][1]).toBe(file);
  });

  it('retains failed and invalid rows but excludes confirmed batches from retry', async () => {
    const onSubmit = jest
      .fn()
      .mockRejectedValueOnce(
        new SpreadsheetImportSubmissionError(
          new Error('Second batch failed'),
          1,
        ),
      )
      .mockResolvedValueOnce(undefined);
    const { user, onClose } = setup(onSubmit, [
      { name: 'Saved' },
      { name: '' },
      { name: 'Retry' },
    ]);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(mockEnqueueDialog).toHaveBeenCalledTimes(1);
    await act(async () => {
      await mockEnqueueDialog.mock.calls[0][0].buttons[1].onClick();
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(screen.getByRole('textbox', { name: 'Row 1' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Row 2' })).toHaveValue('Retry');
    await user.type(
      screen.getByRole('textbox', { name: 'Row 1' }),
      'Corrected',
    );
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[1][0].validStructuredRows).toEqual([
      { name: 'Corrected' },
      { name: 'Retry' },
    ]);
  });

  it('closes after successful submission', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { user, onClose } = setup(onSubmit);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });
});
