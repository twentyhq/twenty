import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useTabList } from '../useTabList';

describe('useTabList', () => {
  it('Should update the activeTabId state', async () => {
    const { result } = renderHook(
      () => {
        const { activeTabId, setActiveTabId } = useTabList('TEST_TAB_LIST_ID');

        return {
          activeTabId,
          setActiveTabId: setActiveTabId,
        };
      },
      {
        wrapper: RecoilRoot,
      },
    );
    expect(result.current.setActiveTabId).toBeInstanceOf(Function);
    expect(result.current.activeTabId).toBeNull();

    act(() => {
      result.current.setActiveTabId('test-value');
    });

    expect(result.current.activeTabId).toBe('test-value');
  });
});
