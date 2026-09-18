import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { CollapseNavigationDrawerWhileSidePanelOpenEffect } from '@/navigation/components/CollapseNavigationDrawerWhileSidePanelOpenEffect';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

let isMobile = false;

jest.mock('twenty-ui/utilities', () => ({
  ...jest.requireActual('twenty-ui/utilities'),
  useIsMobile: () => isMobile,
}));

const setSidePanelOpened = (isOpened: boolean) =>
  act(() => {
    jotaiStore.set(isSidePanelOpenedState.atom, isOpened);
  });

const isDrawerExpanded = () =>
  jotaiStore.get(isNavigationDrawerExpandedState.atom);

const renderEffect = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <CollapseNavigationDrawerWhileSidePanelOpenEffect />
    </JotaiProvider>,
  );

describe('CollapseNavigationDrawerWhileSidePanelOpenEffect', () => {
  beforeEach(() => {
    resetJotaiStore();
    isMobile = false;
    jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
    jotaiStore.set(isSidePanelOpenedState.atom, false);
  });

  it('folds the drawer away when the side panel opens over the page', () => {
    renderEffect();

    expect(isDrawerExpanded()).toBe(true);

    setSidePanelOpened(true);

    expect(isDrawerExpanded()).toBe(false);
  });

  it('unfolds it again once the side panel closes', () => {
    renderEffect();

    setSidePanelOpened(true);
    setSidePanelOpened(false);

    expect(isDrawerExpanded()).toBe(true);
  });

  it('unfolds it when the page is left with the panel still open', () => {
    const { unmount } = renderEffect();

    setSidePanelOpened(true);
    expect(isDrawerExpanded()).toBe(false);

    unmount();

    expect(isDrawerExpanded()).toBe(true);
  });

  it('leaves a drawer the reader opened again alone', () => {
    renderEffect();

    setSidePanelOpened(true);
    expect(isDrawerExpanded()).toBe(false);

    act(() => {
      jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
    });

    expect(isDrawerExpanded()).toBe(true);
  });

  it('leaves a drawer that was already folded closed when the panel goes', () => {
    jotaiStore.set(isNavigationDrawerExpandedState.atom, false);
    renderEffect();

    setSidePanelOpened(true);
    setSidePanelOpened(false);

    expect(isDrawerExpanded()).toBe(false);
  });

  it('does nothing on a phone, where the drawer is an overlay', () => {
    isMobile = true;
    renderEffect();

    setSidePanelOpened(true);

    expect(isDrawerExpanded()).toBe(true);
  });
});
