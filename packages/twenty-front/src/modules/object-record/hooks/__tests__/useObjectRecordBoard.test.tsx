import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useObjectRecordBoardDeprecated } from '@/object-record/hooks/useObjectRecordBoardDeprecated';
import { RecordBoardDeprecatedScope } from '@/object-record/record-board-deprecated/scopes/RecordBoardDeprecatedScope';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

const recordBoardId = '783932a0-28c7-4607-b2ce-6543fa2be892';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <RecordBoardDeprecatedScope recordBoardScopeId={recordBoardId}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <MockedProvider addTypename={false}>{children}</MockedProvider>
      </SnackBarProviderScope>
    </RecordBoardDeprecatedScope>
  </RecoilRoot>
);

describe('useObjectRecordBoardDeprecated', () => {
  it('should skip fetch if currentWorkspace is undefined', async () => {
    const { result } = renderHook(() => useObjectRecordBoardDeprecated(), {
      wrapper: Wrapper,
    });

    expect(result.current.loading).toBe(false);
    expect(Array.isArray(result.current.opportunities)).toBe(true);
  });
});
