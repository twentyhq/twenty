import { renderHook } from '@testing-library/react';

import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { mockedSpreadsheetOptions } from '@/spreadsheet-import/hooks/__tests__/useSpreadsheetImport.test';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactSpreadsheetImportContextProvider values={mockedSpreadsheetOptions}>
    {children}
  </ReactSpreadsheetImportContextProvider>
);

describe('useSpreadsheetImportInternal', () => {
  it('should return the value provided by provider component', async () => {
    const { result } = renderHook(() => useSpreadsheetImportInternal(), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(mockedSpreadsheetOptions);
  });
});
