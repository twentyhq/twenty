import { useUpdateSidePanelPageInfo } from '@/side-panel/hooks/useUpdateSidePanelPageInfo';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconArrowDown, IconDotsVertical } from 'twenty-ui/display';

const mockedPageInfo = {
  title: 'Initial Title',
  Icon: IconDotsVertical,
  instanceId: 'test-instance',
};

const mockedNavigationStack = [
  {
    page: SidePanelPages.CommandMenuDisplay,
    pageTitle: 'Initial Title',
    pageIcon: IconDotsVertical,
    pageId: 'test-page-id',
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useUpdateSidePanelPageInfo', () => {
  beforeEach(() => {
    jotaiStore.set(sidePanelNavigationStackState.atom, mockedNavigationStack);
    jotaiStore.set(sidePanelPageInfoState.atom, mockedPageInfo);
  });

  const renderHooks = () => {
    const { result } = renderHook(
      () => {
        const { updateSidePanelPageInfo } = useUpdateSidePanelPageInfo();

        return {
          updateSidePanelPageInfo,
        };
      },
      { wrapper: Wrapper },
    );

    return {
      result,
    };
  };

  it('should update command menu page info with new title and icon', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.updateSidePanelPageInfo({
        pageTitle: 'New Title',
        pageIcon: IconArrowDown,
      });
    });

    const sidePanelNavigationStack = jotaiStore.get(
      sidePanelNavigationStackState.atom,
    );
    expect(sidePanelNavigationStack).toEqual([
      {
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: 'New Title',
        pageIcon: IconArrowDown,
        pageId: 'test-page-id',
      },
    ]);

    const sidePanelPageInfo = jotaiStore.get(sidePanelPageInfoState.atom);
    expect(sidePanelPageInfo).toEqual({
      title: 'New Title',
      Icon: IconArrowDown,
      instanceId: 'test-instance',
    });
  });

  it('should update command menu page info with new title', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.updateSidePanelPageInfo({
        pageTitle: 'New Title',
      });
    });

    const sidePanelNavigationStack = jotaiStore.get(
      sidePanelNavigationStackState.atom,
    );
    expect(sidePanelNavigationStack).toEqual([
      {
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: 'New Title',
        pageIcon: IconDotsVertical,
        pageId: 'test-page-id',
      },
    ]);

    const sidePanelPageInfo = jotaiStore.get(sidePanelPageInfoState.atom);
    expect(sidePanelPageInfo).toEqual({
      title: 'New Title',
      Icon: IconDotsVertical,
      instanceId: 'test-instance',
    });
  });

  it('should update command menu page info with new icon', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.updateSidePanelPageInfo({
        pageIcon: IconArrowDown,
      });
    });

    const sidePanelNavigationStack = jotaiStore.get(
      sidePanelNavigationStackState.atom,
    );
    expect(sidePanelNavigationStack).toEqual([
      {
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: 'Initial Title',
        pageIcon: IconArrowDown,
        pageId: 'test-page-id',
      },
    ]);

    const sidePanelPageInfo = jotaiStore.get(sidePanelPageInfoState.atom);
    expect(sidePanelPageInfo).toEqual({
      title: 'Initial Title',
      Icon: IconArrowDown,
      instanceId: 'test-instance',
    });
  });
});
