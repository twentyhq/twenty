import { act, render, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { useContext, type Context, type createContext } from 'react';

type SetEditableFocused = (focused: boolean) => void;

jest.mock('twenty-front-component-renderer', () => {
  const ReactForMock = require('react') as {
    createContext: typeof createContext;
  };
  return {
    FrontComponentInputFocusContext:
      ReactForMock.createContext<SetEditableFocused | null>(null),
  };
});

import { FrontComponentRendererProvider } from '@/front-components/components/FrontComponentRendererProvider';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const { FrontComponentInputFocusContext } = jest.requireMock(
  'twenty-front-component-renderer',
) as {
  FrontComponentInputFocusContext: Context<SetEditableFocused | null>;
};

const FRONT_COMPONENT_ID = 'fc-1';
const EXPECTED_FOCUS_ID = `front-component-input-focus-${FRONT_COMPONENT_ID}`;

const TestConsumerEffect = ({
  onCallbackResolved,
}: {
  onCallbackResolved: (setEditableFocused: SetEditableFocused | null) => void;
}) => {
  const setEditableFocused = useContext(FrontComponentInputFocusContext);
  onCallbackResolved(setEditableFocused);
  return null;
};

const renderProviderWithStore = () => {
  const store = createStore();
  let resolvedSetEditableFocused: SetEditableFocused | null | undefined;

  const result = render(
    <JotaiProvider store={store}>
      <FrontComponentRendererProvider frontComponentId={FRONT_COMPONENT_ID}>
        <TestConsumerEffect
          onCallbackResolved={(callback) => {
            resolvedSetEditableFocused = callback;
          }}
        />
      </FrontComponentRendererProvider>
    </JotaiProvider>,
  );

  const getFocusStack = () =>
    renderHook(() => useAtomStateValue(focusStackState), {
      wrapper: ({ children }) => (
        <JotaiProvider store={store}>{children}</JotaiProvider>
      ),
    }).result.current;

  return {
    store,
    getFocusStack,
    getSetEditableFocused: () => resolvedSetEditableFocused,
    unmount: result.unmount,
  };
};

describe('FrontComponentRendererProvider', () => {
  it('should expose a setEditableFocused callback through the context', () => {
    const { getSetEditableFocused } = renderProviderWithStore();
    expect(typeof getSetEditableFocused()).toBe('function');
  });

  it('should push a focus item with suppressed keyboard hotkeys when called with true', () => {
    const { getSetEditableFocused, getFocusStack } = renderProviderWithStore();

    act(() => {
      getSetEditableFocused()?.(true);
    });

    expect(getFocusStack()).toEqual([
      {
        focusId: EXPECTED_FOCUS_ID,
        componentInstance: {
          componentType: FocusComponentType.TEXT_INPUT,
          componentInstanceId: EXPECTED_FOCUS_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      },
    ]);
  });

  it('should remove the focus item when called with false', () => {
    const { getSetEditableFocused, getFocusStack } = renderProviderWithStore();

    act(() => {
      getSetEditableFocused()?.(true);
    });
    expect(getFocusStack()).toHaveLength(1);

    act(() => {
      getSetEditableFocused()?.(false);
    });
    expect(getFocusStack()).toEqual([]);
  });

  it('should end in pushed state when focus moves between editable fields (true→false→true)', () => {
    const { getSetEditableFocused, getFocusStack } = renderProviderWithStore();

    act(() => {
      getSetEditableFocused()?.(true);
      getSetEditableFocused()?.(false);
      getSetEditableFocused()?.(true);
    });

    expect(getFocusStack()).toHaveLength(1);
    expect(getFocusStack()[0].focusId).toBe(EXPECTED_FOCUS_ID);
  });

  it('should remove the focus item on unmount', () => {
    const { getSetEditableFocused, getFocusStack, unmount } =
      renderProviderWithStore();

    act(() => {
      getSetEditableFocused()?.(true);
    });
    expect(getFocusStack()).toHaveLength(1);

    act(() => {
      unmount();
    });

    expect(getFocusStack()).toEqual([]);
  });
});
