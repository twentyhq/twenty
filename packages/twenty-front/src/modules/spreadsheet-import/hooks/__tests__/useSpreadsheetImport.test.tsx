import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState } from 'recoil';

import { useSpreadsheetImport } from '@/spreadsheet-import/hooks/useSpreadsheetImport';
import { spreadsheetImportState } from '@/spreadsheet-import/states/spreadsheetImportState';
import { StepType } from '@/spreadsheet-import/steps/components/UploadFlow';
import { RawData, SpreadsheetOptions } from '@/spreadsheet-import/types';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);
type SpreadsheetKey = 'spreadsheet_key';

export const mockedSpreadsheetOptions: SpreadsheetOptions<SpreadsheetKey> = {
  isOpen: true,
  onClose: () => {},
  fields: [],
  uploadStepHook: async () => [],
  selectHeaderStepHook: async (headerValues: RawData, data: RawData[]) => ({
    headerValues,
    data,
  }),
  matchColumnsStepHook: async () => [],
  rowHook: () => ({ spreadsheet_key: 'rowHook' }),
  tableHook: () => [{ spreadsheet_key: 'tableHook' }],
  onSubmit: async () => {},
  allowInvalidSubmit: false,
  customTheme: {},
  maxRecords: 10,
  maxFileSize: 50,
  autoMapHeaders: true,
  autoMapDistance: 1,
  initialStepState: {
    type: StepType.upload,
  },
  dateFormat: 'MM/DD/YY',
  parseRaw: true,
  rtl: false,
  selectHeader: true,
};

describe('useSpreadsheetImport', () => {
  it('should set isOpen to true, and update the options in the Recoil state', async () => {
    const { result } = renderHook(
      () => ({
        useSpreadsheetImport: useSpreadsheetImport<SpreadsheetKey>(),
        spreadsheetImportState: useRecoilState(spreadsheetImportState)[0],
      }),
      {
        wrapper: Wrapper,
      },
    );
    expect(result.current.spreadsheetImportState).toStrictEqual({
      isOpen: false,
      options: null,
    });
    act(() => {
      result.current.useSpreadsheetImport.openSpreadsheetImport(
        mockedSpreadsheetOptions,
      );
    });
    expect(result.current.spreadsheetImportState).toStrictEqual({
      isOpen: true,
      options: mockedSpreadsheetOptions,
    });
  });
});
