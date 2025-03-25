import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { IconComponent, IconDotsVertical, IconUser } from 'twenty-ui';
import { useUpdateCommandMenuPageInfo } from '../useUpdateCommandMenuPageInfo';

const mockNavigateCommandMenu = jest.fn();

jest.mock('@/command-menu/hooks/useNavigateCommandMenu', () => ({
  useNavigateCommandMenu: () => ({
    navigateCommandMenu: mockNavigateCommandMenu,
  }),
}));

const RecoilInitializer = ({ page, title, icon }: { page: CommandMenuPages; title?: string; icon?: IconComponent }) => {
  const setCommandMenuPage = useSetRecoilState(commandMenuPageState);
  const setCommandMenuPageInfo = useSetRecoilState(commandMenuPageInfoState);

  setCommandMenuPage(page);
  setCommandMenuPageInfo({
    title,
    Icon: icon,
    instanceId: '1',
  });

  return null;
};

describe('useUpdateCommandMenuPageInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update page title', () => {
    const { result } = renderHook(() => useUpdateCommandMenuPageInfo(), {
      wrapper: ({ children }) => (
        <RecoilRoot>
          <RecoilInitializer
            page={CommandMenuPages.Root}
            title="Old Title"
            icon={IconDotsVertical}
          />
          {children}
        </RecoilRoot>
      ),
    });

    act(() => {
      result.current.updatePageInfo({ pageTitle: 'New Title' });
    });

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.Root,
      pageTitle: 'New Title',
      pageIcon: IconDotsVertical,
      pageIconColor: undefined,
      resetNavigationStack: false,
    });
  });

  it('should update page icon', () => {
    const { result } = renderHook(() => useUpdateCommandMenuPageInfo(), {
      wrapper: ({ children }) => (
        <RecoilRoot>
          <RecoilInitializer
            page={CommandMenuPages.Root}
            title="Title"
            icon={IconDotsVertical}
          />
          {children}
        </RecoilRoot>
      ),
    });

    act(() => {
      result.current.updatePageInfo({ pageIcon: IconUser });
    });

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.Root,
      pageTitle: 'Title',
      pageIcon: IconUser,
      pageIconColor: undefined,
      resetNavigationStack: false,
    });
  });

  it('should update page icon color', () => {
    const { result } = renderHook(() => useUpdateCommandMenuPageInfo(), {
      wrapper: ({ children }) => (
        <RecoilRoot>
          <RecoilInitializer
            page={CommandMenuPages.Root}
            title="Title"
            icon={IconDotsVertical}
          />
          {children}
        </RecoilRoot>
      ),
    });

    act(() => {
      result.current.updatePageInfo({ pageIconColor: 'red' });
    });

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.Root,
      pageTitle: 'Title',
      pageIcon: IconDotsVertical,
      pageIconColor: 'red',
      resetNavigationStack: false,
    });
  });

  it('should not call navigateCommandMenu if no updates provided', () => {
    const { result } = renderHook(() => useUpdateCommandMenuPageInfo(), {
      wrapper: ({ children }) => (
        <RecoilRoot>
          <RecoilInitializer
            page={CommandMenuPages.Root}
            title="Title"
            icon={IconDotsVertical}
          />
          {children}
        </RecoilRoot>
      ),
    });

    act(() => {
      result.current.updatePageInfo({});
    });

    expect(mockNavigateCommandMenu).not.toHaveBeenCalled();
  });
}); 