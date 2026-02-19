import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const componentId = 'componentId';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useClickOutsideListener', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should toggle the click outside listener activation state', async () => {
    const { result } = renderHook(
      () => {
        return {
          useClickOutside: useClickOutsideListener(componentId),
          isActivated: useRecoilComponentValueV2(
            clickOutsideListenerIsActivatedComponentState,
            componentId,
          ),
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    const toggle = result.current.useClickOutside.toggleClickOutside;

    act(() => {
      toggle(true);
    });

    expect(result.current.isActivated).toBe(true);

    act(() => {
      toggle(false);
    });

    expect(result.current.isActivated).toBe(false);
  });
});
