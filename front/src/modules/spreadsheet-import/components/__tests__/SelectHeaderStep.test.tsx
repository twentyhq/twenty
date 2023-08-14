import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'fs';

import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { SelectHeaderStep } from '@/spreadsheet-import/components/steps/SelectHeaderStep/SelectHeaderStep';
import { StepType } from '@/spreadsheet-import/components/steps/UploadFlow';
import { ReactSpreadsheetImport } from '@/spreadsheet-import/ReactSpreadsheetImport';
import { mockRsiValues } from '@/spreadsheet-import/stories/mockRsiValues';

import '@testing-library/jest-dom';

const MUTATED_HEADER = 'mutated header';
const CONTINUE_BUTTON = 'Next';
const ERROR_MESSAGE = 'Something happened';
const RAW_DATE = '2020-03-03';
const FORMATTED_DATE = '2020/03/03';
const TRAILING_CELL = 'trailingcell';

describe('Select header step tests', () => {
  test('Select header row and click next', async () => {
    const data = [
      ['Some random header'],
      ['2030'],
      ['Name', 'Phone', 'Email'],
      ['John', '123', 'j@j.com'],
      ['Dane', '333', 'dane@bane.com'],
    ];
    const selectRowIndex = 2;

    const onContinue = jest.fn();
    render(
      <Providers rsiValues={mockRsiValues}>
        <ModalWrapper isOpen={true} onClose={() => {}}>
          <SelectHeaderStep data={data} onContinue={onContinue} />
        </ModalWrapper>
      </Providers>,
    );

    const radioButtons = screen.getAllByRole('radio');

    await userEvent.click(radioButtons[selectRowIndex]);

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(onContinue).toBeCalled();
    });
    expect(onContinue.mock.calls[0][0]).toEqual(data[selectRowIndex]);
    expect(onContinue.mock.calls[0][1]).toEqual(data.slice(selectRowIndex + 1));
  });

  test('selectHeaderStepHook should be called after header is selected', async () => {
    const selectHeaderStepHook = jest.fn(async (headerValues, data) => {
      return { headerValues, data };
    });
    render(
      <ReactSpreadsheetImport
        {...mockRsiValues}
        selectHeaderStepHook={selectHeaderStepHook}
      />,
    );
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
    const continueButton = await screen.findByText(CONTINUE_BUTTON, undefined, {
      timeout: 10000,
    });
    fireEvent.click(continueButton);
    await waitFor(() => {
      expect(selectHeaderStepHook).toBeCalledWith(
        ['name', 'age', 'date'],
        [
          ['Josh', '2', '2020-03-03'],
          ['Charlie', '3', '2010-04-04'],
          ['Lena', '50', '1994-02-27'],
        ],
      );
    });
  });
  test('selectHeaderStepHook should be able to modify raw data', async () => {
    const selectHeaderStepHook = jest.fn(
      async ([val, ...headerValues], data) => {
        return { headerValues: [MUTATED_HEADER, ...headerValues], data };
      },
    );
    render(
      <ReactSpreadsheetImport
        {...mockRsiValues}
        selectHeaderStepHook={selectHeaderStepHook}
        initialStepState={{
          type: StepType.selectHeader,
          data: [
            ['name', 'age'],
            ['Josh', '2'],
            ['Charlie', '3'],
            ['Lena', '50'],
          ],
        }}
      />,
    );
    const continueButton = screen.getByText(CONTINUE_BUTTON);
    fireEvent.click(continueButton);
    const mutatedHeader = await screen.findByText(MUTATED_HEADER);

    await waitFor(() => {
      expect(mutatedHeader).toBeInTheDocument();
    });
  });

  test('Should show error toast if error is thrown in selectHeaderStepHook', async () => {
    const selectHeaderStepHook = jest.fn(async () => {
      throw new Error(ERROR_MESSAGE);
      return undefined as any;
    });
    render(
      <ReactSpreadsheetImport
        {...mockRsiValues}
        selectHeaderStepHook={selectHeaderStepHook}
        initialStepState={{
          type: StepType.selectHeader,
          data: [
            ['name', 'age'],
            ['Josh', '2'],
            ['Charlie', '3'],
            ['Lena', '50'],
          ],
        }}
      />,
    );
    const continueButton = screen.getByText(CONTINUE_BUTTON);
    await userEvent.click(continueButton);

    const errorToast = await screen.findAllByText(ERROR_MESSAGE, undefined, {
      timeout: 5000,
    });
    expect(errorToast?.[0]).toBeInTheDocument();
  });

  test('dateFormat property should NOT be applied to dates read from csv files IF parseRaw=true', async () => {
    const file = new File([RAW_DATE], 'test.csv', {
      type: 'text/csv',
    });
    render(
      <ReactSpreadsheetImport
        {...mockRsiValues}
        dateFormat="yyyy/mm/dd"
        parseRaw={true}
      />,
    );

    const uploader = screen.getByTestId('rsi-dropzone');
    fireEvent.drop(uploader, {
      target: { files: [file] },
    });

    const el = await screen.findByText(RAW_DATE, undefined, { timeout: 5000 });
    expect(el).toBeInTheDocument();
  });

  test('dateFormat property should be applied to dates read from csv files IF parseRaw=false', async () => {
    const file = new File([RAW_DATE], 'test.csv', {
      type: 'text/csv',
    });
    render(
      <ReactSpreadsheetImport
        {...mockRsiValues}
        dateFormat="yyyy/mm/dd"
        parseRaw={false}
      />,
    );

    const uploader = screen.getByTestId('rsi-dropzone');
    fireEvent.drop(uploader, {
      target: { files: [file] },
    });

    const el = await screen.findByText(FORMATTED_DATE, undefined, {
      timeout: 5000,
    });
    expect(el).toBeInTheDocument();
  });

  test('dateFormat property should be applied to dates read from xlsx files', async () => {
    render(
      <ReactSpreadsheetImport {...mockRsiValues} dateFormat="yyyy/mm/dd" />,
    );
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
    const el = await screen.findByText(FORMATTED_DATE, undefined, {
      timeout: 10000,
    });
    expect(el).toBeInTheDocument();
  });

  test.skip(
    'trailing (not under a header) cells should be rendered in SelectHeaderStep table, ' +
      'but not in MatchColumnStep if a shorter row is selected as a header',
    async () => {
      const selectHeaderStepHook = jest.fn(async (headerValues, data) => {
        return { headerValues, data };
      });
      render(
        <ReactSpreadsheetImport
          {...mockRsiValues}
          selectHeaderStepHook={selectHeaderStepHook}
        />,
      );
      const uploader = screen.getByTestId('rsi-dropzone');
      const data = readFileSync(
        __dirname + '/../../../../static/TrailingCellsWorkbook.xlsx',
      );
      fireEvent.drop(uploader, {
        target: {
          files: [
            new File([data], 'testFile.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
          ],
        },
      });
      const trailingCell = await screen.findByText(TRAILING_CELL, undefined, {
        timeout: 10000,
      });
      expect(trailingCell).toBeInTheDocument();
      const nextButton = screen.getByRole('button', {
        name: 'Next',
      });
      await userEvent.click(nextButton);
      const trailingCellNextPage = await screen.findByText(
        TRAILING_CELL,
        undefined,
        { timeout: 10000 },
      );
      expect(trailingCellNextPage).not.toBeInTheDocument();
    },
  );
});
