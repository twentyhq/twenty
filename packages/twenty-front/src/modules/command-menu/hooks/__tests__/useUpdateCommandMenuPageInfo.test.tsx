import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';
import { CommandMenuPages } from 'twenty-shared/types';
import { IconArrowDown, IconDotsVertical } from 'twenty-ui/display';

const mockedPageInfo = {
  title: 'Initial Title',
  Icon: IconDotsVertical,
  instanceId: 'test-instance',
};

const mockedNavigationStack = [
  {
    page: CommandMenuPages.Root,
    pageTitle: 'Initial Title',
    pageIcon: IconDotsVertical,
    pageId: 'test-page-id',
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useUpdateCommandMenuPageInfo', () => {
  beforeEach(() => {
    jotaiStore.set(commandMenuNavigationStackState.atom, mockedNavigationStack);
    jotaiStore.set(commandMenuPageInfoState.atom, mockedPageInfo);
  });

  const renderHooks = () => {
    const { result } = renderHook(
      () => {
        const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();

        return {
          updateCommandMenuPageInfo,
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
      result.current.updateCommandMenuPageInfo({
        pageTitle: 'New Title',
        pageIcon: IconArrowDown,
      });
    });

    const commandMenuNavigationStack = jotaiStore.get(
      commandMenuNavigationStackState.atom,
    );
    expect(commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.Root,
        pageTitle: 'New Title',
        pageIcon: IconArrowDown,
        pageId: 'test-page-id',
      },
    ]);

    const commandMenuPageInfo = jotaiStore.get(commandMenuPageInfoState.atom);
    expect(commandMenuPageInfo).toEqual({
      title: 'New Title',
      Icon: IconArrowDown,
      instanceId: 'test-instance',
    });
  });

  it('should update command menu page info with new title', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.updateCommandMenuPageInfo({
        pageTitle: 'New Title',
      });
    });

    const commandMenuNavigationStack = jotaiStore.get(
      commandMenuNavigationStackState.atom,
    );
    expect(commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.Root,
        pageTitle: 'New Title',
        pageIcon: IconDotsVertical,
        pageId: 'test-page-id',
      },
    ]);

    const commandMenuPageInfo = jotaiStore.get(commandMenuPageInfoState.atom);
    expect(commandMenuPageInfo).toEqual({
      title: 'New Title',
      Icon: IconDotsVertical,
      instanceId: 'test-instance',
    });
  });

  it('should update command menu page info with new icon', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.updateCommandMenuPageInfo({
        pageIcon: IconArrowDown,
      });
    });

    const commandMenuNavigationStack = jotaiStore.get(
      commandMenuNavigationStackState.atom,
    );
    expect(commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.Root,
        pageTitle: 'Initial Title',
        pageIcon: IconArrowDown,
        pageId: 'test-page-id',
      },
    ]);

    const commandMenuPageInfo = jotaiStore.get(commandMenuPageInfoState.atom);
    expect(commandMenuPageInfo).toEqual({
      title: 'Initial Title',
      Icon: IconArrowDown,
      instanceId: 'test-instance',
    });
  });
});
