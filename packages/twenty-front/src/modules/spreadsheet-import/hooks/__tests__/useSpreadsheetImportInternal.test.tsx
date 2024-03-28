import { renderHook } from '@testing-library/react';

import { Providers } from '@/spreadsheet-import/components/Providers';
import { mockedSpreadsheetOptions } from '@/spreadsheet-import/hooks/__tests__/useSpreadsheetImport.test';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <Providers values={mockedSpreadsheetOptions}>{children}</Providers>
);

describe('useSpreadsheetImportInternal', () => {
  it('should return the value provided by provider component', async () => {
    const { result } = renderHook(() => useSpreadsheetImportInternal(), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(mockedSpreadsheetOptions);
  });
});
