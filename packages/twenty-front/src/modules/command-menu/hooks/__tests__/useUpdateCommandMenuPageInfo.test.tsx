import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';
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
  <RecoilRoot
    initializeState={({ set }) => {
      set(commandMenuNavigationStackState, mockedNavigationStack);
      set(commandMenuPageInfoState, mockedPageInfo);
    }}
  >
    {children}
  </RecoilRoot>
);

describe('useUpdateCommandMenuPageInfo', () => {
  const renderHooks = () => {
    const { result } = renderHook(
      () => {
        const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();
        const commandMenuNavigationStack = useRecoilValue(
          commandMenuNavigationStackState,
        );
        const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);

        return {
          updateCommandMenuPageInfo,
          commandMenuNavigationStack,
          commandMenuPageInfo,
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

    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.Root,
        pageTitle: 'New Title',
        pageIcon: IconArrowDown,
        pageId: 'test-page-id',
      },
    ]);

    expect(result.current.commandMenuPageInfo).toEqual({
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

    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.Root,
        pageTitle: 'New Title',
        pageIcon: IconDotsVertical,
        pageId: 'test-page-id',
      },
    ]);

    expect(result.current.commandMenuPageInfo).toEqual({
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

    expect(result.current.commandMenuNavigationStack).toEqual([
      {
        page: CommandMenuPages.Root,
        pageTitle: 'Initial Title',
        pageIcon: IconArrowDown,
        pageId: 'test-page-id',
      },
    ]);

    expect(result.current.commandMenuPageInfo).toEqual({
      title: 'Initial Title',
      Icon: IconArrowDown,
      instanceId: 'test-instance',
    });
  });
});
