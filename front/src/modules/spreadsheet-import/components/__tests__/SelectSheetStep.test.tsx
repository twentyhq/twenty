import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'fs';

import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { SelectSheetStep } from '@/spreadsheet-import/components/steps/SelectSheetStep/SelectSheetStep';
import {
  defaultTheme,
  ReactSpreadsheetImport,
} from '@/spreadsheet-import/ReactSpreadsheetImport';
import { mockRsiValues } from '@/spreadsheet-import/stories/mockRsiValues';

import '@testing-library/jest-dom';

const SHEET_TITLE_1 = 'Sheet1';
const SHEET_TITLE_2 = 'Sheet2';
const SELECT_HEADER_TABLE_ENTRY_1 = 'Charlie';
const SELECT_HEADER_TABLE_ENTRY_2 = 'Josh';
const SELECT_HEADER_TABLE_ENTRY_3 = '50';
const ERROR_MESSAGE = 'Something happened';

test('Should render select sheet screen if multi-sheet excel file was uploaded', async () => {
  render(<ReactSpreadsheetImport {...mockRsiValues} />);
  const uploader = screen.getByTestId('rsi-dropzone');
  const data = readFileSync(__dirname + '/../../../../static/Workbook1.xlsx');
  fireEvent.drop(uploader, {
    target: {
      files: [
        new File([data], 'testFile.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      ],
    },
  });

  const sheetTitle = await screen.findByText(SHEET_TITLE_1, undefined, {
    timeout: 5000,
  });
  const sheetTitle2 = screen.getByRole('radio', { name: SHEET_TITLE_2 });
  expect(sheetTitle).toBeInTheDocument();
  expect(sheetTitle2).toBeInTheDocument();
});

test('Should render select header screen with relevant data if single-sheet excel file was uploaded', async () => {
  render(<ReactSpreadsheetImport {...mockRsiValues} />);
  const uploader = screen.getByTestId('rsi-dropzone');
  const data = readFileSync(__dirname + '/../../../../static/Workbook2.xlsx');
  fireEvent.drop(uploader, {
    target: {
      files: [
        new File([data], 'testFile.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      ],
    },
  });
  const tableEntry1 = await screen.findByText(
    SELECT_HEADER_TABLE_ENTRY_1,
    undefined,
    { timeout: 5000 },
  );
  const tableEntry2 = screen.getByRole('gridcell', {
    name: SELECT_HEADER_TABLE_ENTRY_2,
  });
  const tableEntry3 = screen.getByRole('gridcell', {
    name: SELECT_HEADER_TABLE_ENTRY_3,
  });

  expect(tableEntry1).toBeInTheDocument();
  expect(tableEntry2).toBeInTheDocument();
  expect(tableEntry3).toBeInTheDocument();
});

test('Select sheet and click next', async () => {
  const sheetNames = ['Sheet1', 'Sheet2'];
  const selectSheetIndex = 1;

  const onContinue = jest.fn();
  render(
    <Providers theme={defaultTheme} rsiValues={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => {}}>
        <SelectSheetStep sheetNames={sheetNames} onContinue={onContinue} />
      </ModalWrapper>
    </Providers>,
  );

  const firstRadio = screen.getByLabelText(sheetNames[selectSheetIndex]);

  await userEvent.click(firstRadio);

  const nextButton = screen.getByRole('button', {
    name: 'Next',
  });

  await userEvent.click(nextButton);

  await waitFor(() => {
    expect(onContinue).toBeCalled();
  });
  expect(onContinue.mock.calls[0][0]).toEqual(sheetNames[selectSheetIndex]);
});

test('Should show error toast if error is thrown in uploadStepHook', async () => {
  const uploadStepHook = jest.fn(async () => {
    throw new Error(ERROR_MESSAGE);
    return undefined as any;
  });
  render(
    <ReactSpreadsheetImport
      {...mockRsiValues}
      uploadStepHook={uploadStepHook}
    />,
  );
  const uploader = screen.getByTestId('rsi-dropzone');
  const data = readFileSync(__dirname + '/../../../../static/Workbook1.xlsx');
  fireEvent.drop(uploader, {
    target: {
      files: [
        new File([data], 'testFile.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      ],
    },
  });

  const nextButton = await screen.findByRole(
    'button',
    {
      name: 'Next',
    },
    { timeout: 5000 },
  );

  await userEvent.click(nextButton);

  const errorToast = await screen.findAllByText(ERROR_MESSAGE, undefined, {
    timeout: 5000,
  });
  expect(errorToast?.[0]).toBeInTheDocument();
});
