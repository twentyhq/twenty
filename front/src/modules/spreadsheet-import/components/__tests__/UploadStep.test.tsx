import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { SpreadsheetImport } from '@/spreadsheet-import/components/SpreadsheetImport';
import { UploadStep } from '@/spreadsheet-import/components/steps/UploadStep/UploadStep';
import { mockRsiValues } from '@/spreadsheet-import/tests/mockRsiValues';

import '@testing-library/jest-dom';

const MUTATED_RAW_DATA = 'Bye';
const ERROR_MESSAGE = 'Something happened while uploading';

test('Upload a file', async () => {
  const file = new File(['Hello, Hello, Hello, Hello'], 'test.csv', {
    type: 'text/csv',
  });

  const onContinue = jest.fn();
  render(
    <Providers rsiValues={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={jest.fn()}>
        <UploadStep onContinue={onContinue} />
      </ModalWrapper>
    </Providers>,
  );

  const uploader = screen.getByTestId('rsi-dropzone');
  fireEvent.drop(uploader, {
    target: { files: [file] },
  });
  await waitFor(
    () => {
      expect(onContinue).toBeCalled();
    },
    { timeout: 5000 },
  );
});

test('Should call uploadStepHook on file upload', async () => {
  const file = new File(['Hello, Hello, Hello, Hello'], 'test.csv', {
    type: 'text/csv',
  });
  const uploadStepHook = jest.fn(async (values) => {
    return values;
  });
  render(
    <SpreadsheetImport {...mockRsiValues} uploadStepHook={uploadStepHook} />,
  );
  const uploader = screen.getByTestId('rsi-dropzone');
  fireEvent.drop(uploader, {
    target: { files: [file] },
  });

  await waitFor(
    () => {
      expect(uploadStepHook).toBeCalled();
    },
    { timeout: 5000 },
  );
});

test('uploadStepHook should be able to mutate raw upload data', async () => {
  const file = new File(['Hello, Hello, Hello, Hello'], 'test.csv', {
    type: 'text/csv',
  });
  const uploadStepHook = jest.fn(async ([[, ...values]]) => {
    return [[MUTATED_RAW_DATA, ...values]];
  });
  render(
    <SpreadsheetImport {...mockRsiValues} uploadStepHook={uploadStepHook} />,
  );

  const uploader = screen.getByTestId('rsi-dropzone');
  fireEvent.drop(uploader, {
    target: { files: [file] },
  });

  const el = await screen.findByText(MUTATED_RAW_DATA, undefined, {
    timeout: 5000,
  });
  expect(el).toBeInTheDocument();
});

test('Should show error toast if error is thrown in uploadStepHook', async () => {
  const file = new File(['Hello, Hello, Hello, Hello'], 'test.csv', {
    type: 'text/csv',
  });
  const uploadStepHook = jest.fn(async () => {
    throw new Error(ERROR_MESSAGE);
  });
  render(
    <SpreadsheetImport {...mockRsiValues} uploadStepHook={uploadStepHook} />,
  );

  const uploader = screen.getByTestId('rsi-dropzone');
  fireEvent.drop(uploader, {
    target: { files: [file] },
  });

  const errorToast = await screen.findAllByText(ERROR_MESSAGE, undefined, {
    timeout: 5000,
  });
  expect(errorToast?.[0]).toBeInTheDocument();
});
