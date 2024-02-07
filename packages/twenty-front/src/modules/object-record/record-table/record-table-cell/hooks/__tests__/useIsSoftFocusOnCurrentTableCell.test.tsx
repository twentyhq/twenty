import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import {
  recordTableCell,
  recordTableRow,
} from '@/object-record/record-table/record-table-cell/hooks/__mocks__/cell';
import { useIsSoftFocusOnCurrentTableCell } from '@/object-record/record-table/record-table-cell/hooks/useIsSoftFocusOnCurrentTableCell';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <RecordTableScope recordTableScopeId="scopeId" onColumnsChange={jest.fn()}>
      <RecordTableRowContext.Provider value={recordTableRow}>
        <RecordTableCellContext.Provider value={recordTableCell}>
          {children}
        </RecordTableCellContext.Provider>
      </RecordTableRowContext.Provider>
    </RecordTableScope>
  </RecoilRoot>
);

describe('useIsSoftFocusOnCurrentTableCell', () => {
  it('should work as expected', () => {
    const { result } = renderHook(() => useIsSoftFocusOnCurrentTableCell(), {
      wrapper: Wrapper,
    });

    expect(result.current).toBe(false);
  });
});
