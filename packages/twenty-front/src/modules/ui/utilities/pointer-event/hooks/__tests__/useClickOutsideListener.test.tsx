import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { clickOutsideListenerIsActivatedComponentState } from '@/ui/utilities/pointer-event/states/clickOutsideListenerIsActivatedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

const componentId = 'componentId';

describe('useClickOutsideListener', () => {
  it('should toggle the click outside listener activation state', async () => {
    const { result } = renderHook(
      () => {
        return {
          useClickOutside: useClickOutsideListener(componentId),
          isActivated: useRecoilComponentValue(
            clickOutsideListenerIsActivatedComponentState,
            componentId,
          ),
        };
      },
      {
        wrapper: RecoilRoot,
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
