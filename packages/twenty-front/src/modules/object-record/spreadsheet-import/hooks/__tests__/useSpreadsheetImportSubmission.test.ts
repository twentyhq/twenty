import { act, renderHook } from '@testing-library/react';

import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { SpreadsheetImportSubmissionError } from '@/spreadsheet-import/errors/SpreadsheetImportSubmissionError';
import { type SpreadsheetImportDialogOptions } from '@/spreadsheet-import/types';

const mockBatchCreateManyRecords = jest.fn();
const mockRefetchQueries = jest.fn();
const mockOpenSpreadsheetImportDialog = jest.fn();
const mockEnqueueToast = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ refetchQueries: mockRefetchQueries }),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: {
      updatableFields: [],
      fields: [{ id: 'id', name: 'id', type: 'UUID' }],
      indexMetadatas: [],
      namePlural: 'people',
    },
  }),
}));
jest.mock(
  '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject',
  () => ({
    useGenerateDepthRecordGqlFieldsFromObject: () => ({ recordGqlFields: {} }),
  }),
);
jest.mock('@/object-record/hooks/useBatchCreateManyRecords', () => ({
  useBatchCreateManyRecords: () => ({
    batchCreateManyRecords: mockBatchCreateManyRecords,
  }),
}));
jest.mock(
  '@/object-record/spreadsheet-import/hooks/useBuildSpreadSheetImportFields',
  () => ({
    useBuildSpreadsheetImportFields: () => ({
      buildSpreadsheetImportFields: () => [],
    }),
  }),
);
jest.mock('@/spreadsheet-import/hooks/useOpenSpreadsheetImportDialog', () => ({
  useOpenSpreadsheetImportDialog: () => ({
    openSpreadsheetImportDialog: mockOpenSpreadsheetImportDialog,
  }),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: () => jest.fn(),
}));
jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

const setup = () => {
  const { result } = renderHook(() =>
    useOpenObjectRecordsSpreadsheetImportDialog('person'),
  );
  act(() => result.current.openObjectRecordsSpreadsheetImportDialog());
  const options: SpreadsheetImportDialogOptions =
    mockOpenSpreadsheetImportDialog.mock.calls[0][0];
  return () =>
    options.onSubmit(
      {
        validStructuredRows: [{}, {}],
        invalidStructuredRows: [],
        allStructuredRows: [{ __index: 'first' }, { __index: 'second' }],
      },
      new File([''], 'people.csv'),
    );
};

describe('spreadsheet import submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBatchCreateManyRecords.mockReset();
    mockRefetchQueries.mockReset().mockResolvedValue(undefined);
  });

  it('propagates creation failure with the original cause and no confirmed rows', async () => {
    const error = new Error('Server unavailable');
    mockBatchCreateManyRecords.mockRejectedValue(error);
    await expect(setup()()).rejects.toMatchObject({
      cause: error,
      importedRowCount: 0,
    });
    expect(mockRefetchQueries).toHaveBeenCalledTimes(1);
    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('reports confirmed batches when a later batch fails even if refreshing also fails', async () => {
    const error = new Error('Second batch failed');
    mockBatchCreateManyRecords.mockImplementation(
      async ({ onBatchCompleted }) => {
        onBatchCompleted(1);
        throw error;
      },
    );
    mockRefetchQueries.mockRejectedValue(new Error('Refresh failed'));
    const submission = setup()();
    await expect(submission).rejects.toBeInstanceOf(
      SpreadsheetImportSubmissionError,
    );
    await expect(submission).rejects.toMatchObject({
      cause: error,
      importedRowCount: 1,
    });
  });

  it('does not reopen submission if aggregate refresh fails after every batch was confirmed', async () => {
    mockBatchCreateManyRecords.mockImplementation(
      async ({ onBatchCompleted }) => {
        onBatchCompleted(2);
        throw new Error('Aggregate refresh failed');
      },
    );
    await expect(setup()()).resolves.toBeUndefined();
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
    expect(mockRefetchQueries).toHaveBeenCalledTimes(1);
  });

  it('does not retry saved records when only refreshing the list fails', async () => {
    mockBatchCreateManyRecords.mockResolvedValue([]);
    mockRefetchQueries.mockRejectedValue(new Error('Refresh failed'));
    await expect(setup()()).resolves.toBeUndefined();
    expect(mockBatchCreateManyRecords).toHaveBeenCalledTimes(1);
    expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
  });
});
