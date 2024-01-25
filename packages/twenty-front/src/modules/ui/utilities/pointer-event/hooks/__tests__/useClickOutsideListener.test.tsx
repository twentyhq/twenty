import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useClickOustideListenerStates } from '@/ui/utilities/pointer-event/hooks/useClickOustideListenerStates';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

const componentId = 'componentId';

describe('useClickOutsideListener', () => {
  it('should toggle the click outside listener activation state', async () => {
    const { result } = renderHook(
      () => {
        const { getClickOutsideListenerIsActivatedState } =
          useClickOustideListenerStates(componentId);

        return {
          useClickOutside: useClickOutsideListener(componentId),
          isActivated: useRecoilValue(
            getClickOutsideListenerIsActivatedState(),
          ),
        };
      },
      {
        wrapper: RecoilRoot,
      },
    );

    const toggle = result.current.useClickOutside.toggleClickOutsideListener;

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
