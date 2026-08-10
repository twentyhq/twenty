import { act, fireEvent, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { SidePanelForDesktop } from '@/side-panel/components/SidePanelForDesktop';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const sidePanelCloseAnimationCompleteCleanupMock = jest.fn();

let capturedOnContinueChatFromFullWidth: (() => void) | undefined;

jest.mock('@/side-panel/components/SidePanelAskAiHandoffEffect', () => ({
  SidePanelAskAiHandoffEffect: ({
    onContinueChatFromFullWidth,
  }: {
    onContinueChatFromFullWidth: () => void;
  }) => {
    capturedOnContinueChatFromFullWidth = onContinueChatFromFullWidth;
    return null;
  },
}));

jest.mock('@/side-panel/components/SidePanelSearchHandoffEffect', () => ({
  SidePanelSearchHandoffEffect: () => null,
}));

jest.mock('framer-motion', () => ({
  useReducedMotion: () => false,
}));

jest.mock('@/side-panel/components/SidePanelRouter', () => ({
  SidePanelRouter: () => <div data-testid="side-panel-content" />,
}));

jest.mock('@/side-panel/components/SidePanelWidthEffect', () => ({
  SidePanelWidthEffect: () => null,
}));

jest.mock('@/ui/layout/resizable-panel/components/ResizablePanelGap', () => ({
  ResizablePanelGap: () => null,
}));

jest.mock(
  '@/side-panel/hooks/useSidePanelCloseAnimationCompleteCleanup',
  () => ({
    useSidePanelCloseAnimationCompleteCleanup: () => ({
      sidePanelCloseAnimationCompleteCleanup:
        sidePanelCloseAnimationCompleteCleanupMock,
    }),
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const startHandoffShrink = () => {
  act(() => {
    capturedOnContinueChatFromFullWidth?.();
  });
};

describe('SidePanelForDesktop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    capturedOnContinueChatFromFullWidth = undefined;
    sidePanelCloseAnimationCompleteCleanupMock.mockImplementation(() => {
      jotaiStore.set(isSidePanelClosingState.atom, false);
    });
  });

  it('should keep the content mounted while closing after a handoff entrance', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { queryByTestId } = render(<SidePanelForDesktop />, {
      wrapper: Wrapper,
    });

    startHandoffShrink();

    expect(queryByTestId('side-panel-content')).toBeInTheDocument();

    act(() => {
      jotaiStore.set(isSidePanelOpenedState.atom, false);
    });

    expect(queryByTestId('side-panel-content')).toBeInTheDocument();
  });

  it('should shrink from full width when the handoff continues the chat', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { container } = render(<SidePanelForDesktop />, { wrapper: Wrapper });

    const wrapperElement = container.querySelector('[data-side-panel]');

    if (wrapperElement === null) {
      throw new Error('side panel wrapper not found');
    }

    expect(wrapperElement).toHaveAttribute(
      'data-shrink-from-full-width',
      'false',
    );

    startHandoffShrink();

    expect(wrapperElement).toHaveAttribute(
      'data-shrink-from-full-width',
      'true',
    );
  });

  it('should stop shrinking from full width once the entrance animation ends', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { container } = render(<SidePanelForDesktop />, { wrapper: Wrapper });

    const wrapperElement = container.querySelector('[data-side-panel]');

    if (wrapperElement === null) {
      throw new Error('side panel wrapper not found');
    }

    startHandoffShrink();

    expect(wrapperElement).toHaveAttribute(
      'data-shrink-from-full-width',
      'true',
    );

    fireEvent.animationEnd(wrapperElement);

    expect(wrapperElement).toHaveAttribute(
      'data-shrink-from-full-width',
      'false',
    );
  });

  it('should complete the close lifecycle when closed while the entrance animation is still running', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { container, queryByTestId } = render(<SidePanelForDesktop />, {
      wrapper: Wrapper,
    });

    const wrapperElement = container.querySelector('[data-side-panel]');

    if (wrapperElement === null) {
      throw new Error('side panel wrapper not found');
    }

    startHandoffShrink();

    act(() => {
      jotaiStore.set(isSidePanelOpenedState.atom, false);
      jotaiStore.set(isSidePanelClosingState.atom, true);
    });

    fireEvent.animationEnd(wrapperElement);

    expect(sidePanelCloseAnimationCompleteCleanupMock).toHaveBeenCalled();
    expect(queryByTestId('side-panel-content')).not.toBeInTheDocument();
  });

  it('should run the close cleanup once when both the animation and the transition end', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { container } = render(<SidePanelForDesktop />, { wrapper: Wrapper });

    const wrapperElement = container.querySelector('[data-side-panel]');

    if (wrapperElement === null) {
      throw new Error('side panel wrapper not found');
    }

    startHandoffShrink();

    act(() => {
      jotaiStore.set(isSidePanelOpenedState.atom, false);
      jotaiStore.set(isSidePanelClosingState.atom, true);
    });

    fireEvent.animationEnd(wrapperElement);
    fireEvent.transitionEnd(wrapperElement);

    expect(sidePanelCloseAnimationCompleteCleanupMock).toHaveBeenCalledTimes(1);
  });

  it('should not shrink from full width on a normal open', () => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);

    const { container } = render(<SidePanelForDesktop />, { wrapper: Wrapper });

    expect(container.querySelector('[data-side-panel]')).toHaveAttribute(
      'data-shrink-from-full-width',
      'false',
    );
  });
});
