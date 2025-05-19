import { useFocusStack } from '@/ui/utilities/focus/hooks/useFocusStack';
import { currentFocusIdentifierSelector } from '@/ui/utilities/focus/states/currentFocusIdentifierSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const {
        pushFocusIdentifier,
        removeFocusId,
        resetFocusStack,
        resetFocusStackToFocusIdentifier,
      } = useFocusStack();

      const focusStack = useRecoilValue(focusStackState);
      const currentFocusIdentifier = useRecoilValue(
        currentFocusIdentifierSelector,
      );

      return {
        pushFocusIdentifier,
        removeFocusId,
        resetFocusStack,
        resetFocusStackToFocusIdentifier,
        focusStack,
        currentFocusIdentifier,
      };
    },
    {
      wrapper: RecoilRoot,
    },
  );

  return { result };
};

describe('useFocusStack', () => {
  it('should push focus identifier to the stack', async () => {
    const { result } = renderHooks();

    expect(result.current.focusStack).toEqual([]);

    const focusIdentifier = {
      focusId: 'test-focus-id',
      componentType: FocusComponentType.MODAL,
      componentInstanceId: 'test-instance-id',
    };

    await act(async () => {
      result.current.pushFocusIdentifier(focusIdentifier.focusId, {
        type: focusIdentifier.componentType,
        instanceId: focusIdentifier.componentInstanceId,
      });
    });

    expect(result.current.focusStack).toEqual([focusIdentifier]);
    expect(result.current.currentFocusIdentifier).toEqual(focusIdentifier);
    const anotherFocusIdentifier = {
      focusId: 'another-focus-id',
      componentType: FocusComponentType.MODAL,
      componentInstanceId: 'another-instance-id',
    };

    await act(async () => {
      result.current.pushFocusIdentifier(anotherFocusIdentifier.focusId, {
        type: anotherFocusIdentifier.componentType,
        instanceId: anotherFocusIdentifier.componentInstanceId,
      });
    });

    expect(result.current.focusStack).toEqual([
      focusIdentifier,
      anotherFocusIdentifier,
    ]);
    expect(result.current.currentFocusIdentifier).toEqual(
      anotherFocusIdentifier,
    );
  });

  it('should remove focus id from the stack', async () => {
    const { result } = renderHooks();

    const firstFocusIdentifier = {
      focusId: 'first-focus-id',
      componentType: FocusComponentType.MODAL,
      componentInstanceId: 'first-instance-id',
    };

    const secondFocusIdentifier = {
      focusId: 'second-focus-id',
      componentType: FocusComponentType.MODAL,
      componentInstanceId: 'second-instance-id',
    };

    await act(async () => {
      result.current.pushFocusIdentifier(firstFocusIdentifier.focusId, {
        type: firstFocusIdentifier.componentType,
        instanceId: firstFocusIdentifier.componentInstanceId,
      });
    });

    await act(async () => {
      result.current.pushFocusIdentifier(secondFocusIdentifier.focusId, {
        type: secondFocusIdentifier.componentType,
        instanceId: secondFocusIdentifier.componentInstanceId,
      });
    });

    expect(result.current.focusStack).toEqual([
      firstFocusIdentifier,
      secondFocusIdentifier,
    ]);
    expect(result.current.currentFocusIdentifier).toEqual(
      secondFocusIdentifier,
    );

    await act(async () => {
      result.current.removeFocusId(firstFocusIdentifier.focusId);
    });

    expect(result.current.focusStack).toEqual([secondFocusIdentifier]);
    expect(result.current.currentFocusIdentifier).toEqual(
      secondFocusIdentifier,
    );
  });

  it('should reset the focus stack', async () => {
    const { result } = renderHooks();

    const focusIdentifier = {
      focusId: 'test-focus-id',
      componentType: FocusComponentType.MODAL,
      componentInstanceId: 'test-instance-id',
    };

    await act(async () => {
      result.current.pushFocusIdentifier(focusIdentifier.focusId, {
        type: focusIdentifier.componentType,
        instanceId: focusIdentifier.componentInstanceId,
      });
    });

    expect(result.current.focusStack).toEqual([focusIdentifier]);
    expect(result.current.currentFocusIdentifier).toEqual(focusIdentifier);
    await act(async () => {
      result.current.resetFocusStack();
    });

    expect(result.current.focusStack).toEqual([]);
    expect(result.current.currentFocusIdentifier).toEqual(undefined);
  });

  it('should reset the focus stack to a specific focus identifier', async () => {
    const { result } = renderHooks();

    const firstFocusIdentifier = {
      focusId: 'first-focus-id',
      componentType: FocusComponentType.MODAL,
      componentInstanceId: 'first-instance-id',
    };

    const secondFocusIdentifier = {
      focusId: 'second-focus-id',
      componentType: FocusComponentType.MODAL,
      componentInstanceId: 'second-instance-id',
    };

    await act(async () => {
      result.current.pushFocusIdentifier(firstFocusIdentifier.focusId, {
        type: firstFocusIdentifier.componentType,
        instanceId: firstFocusIdentifier.componentInstanceId,
      });
    });

    await act(async () => {
      result.current.pushFocusIdentifier(secondFocusIdentifier.focusId, {
        type: secondFocusIdentifier.componentType,
        instanceId: secondFocusIdentifier.componentInstanceId,
      });
    });

    expect(result.current.focusStack).toEqual([
      firstFocusIdentifier,
      secondFocusIdentifier,
    ]);
    expect(result.current.currentFocusIdentifier).toEqual(
      secondFocusIdentifier,
    );

    const newFocusIdentifier = {
      focusId: 'new-focus-id',
      componentType: FocusComponentType.MODAL,
      componentInstanceId: 'new-instance-id',
    };

    await act(async () => {
      result.current.resetFocusStackToFocusIdentifier(newFocusIdentifier);
    });

    expect(result.current.focusStack).toEqual([newFocusIdentifier]);
    expect(result.current.currentFocusIdentifier).toEqual(newFocusIdentifier);
  });
});
