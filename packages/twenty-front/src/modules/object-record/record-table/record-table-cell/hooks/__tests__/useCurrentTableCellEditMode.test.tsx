import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';

import { useCurrentTableCellEditMode } from '../useCurrentTableCellEditMode';

const onColumnsChange = jest.fn();

const scopeId = 'scopeId';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <RecordTableScope
      recordTableScopeId={scopeId}
      onColumnsChange={onColumnsChange}
    >
      {children}
    </RecordTableScope>
  </RecoilRoot>
);

describe('useCurrentTableCellEditMode.', () => {
  it('should return initial values', () => {
    const { result } = renderHook(() => useCurrentTableCellEditMode(), {
      wrapper: Wrapper,
    });

    expect(result.current.isCurrentTableCellInEditMode).toBe(false);
    expect(result.current.setCurrentTableCellInEditMode).toBeInstanceOf(
      Function,
    );
  });

  it('should call setCurrentTableCellInEditMode', async () => {
    const { result } = renderHook(() => useCurrentTableCellEditMode(), {
      wrapper: Wrapper,
    });

    expect(result.current.isCurrentTableCellInEditMode).toBe(false);

    act(() => {
      result.current.setCurrentTableCellInEditMode();
    });

    await waitFor(() => {
      expect(result.current.isCurrentTableCellInEditMode).toBe(true);
    });
  });
});
