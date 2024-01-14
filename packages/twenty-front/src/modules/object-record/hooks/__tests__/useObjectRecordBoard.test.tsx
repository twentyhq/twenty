import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useObjectRecordBoard } from '@/object-record/hooks/useObjectRecordBoard';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

const recordBoardId = '783932a0-28c7-4607-b2ce-6543fa2be892';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <RecordBoardScope recordBoardScopeId={recordBoardId}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <MockedProvider addTypename={false}>{children}</MockedProvider>
      </SnackBarProviderScope>
    </RecordBoardScope>
  </RecoilRoot>
);

describe('useObjectRecordBoard', () => {
  it('should skip fetch if currentWorkspace is undefined', async () => {
    const { result } = renderHook(() => useObjectRecordBoard(), {
      wrapper: Wrapper,
    });

    expect(result.current.loading).toBe(false);
    expect(Array.isArray(result.current.opportunities)).toBe(true);
  });
});
