import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuCommandsComponentSelector } from '@/command-menu/states/commandMenuCommandsSelector';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>
    <MemoryRouter
      initialEntries={['/one', '/two', { pathname: '/three' }]}
      initialIndex={1}
    >
      {children}
    </MemoryRouter>
  </RecoilRoot>
);

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const commandMenu = useCommandMenu();
      const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);
      const commandMenuCommands = useRecoilComponentValueV2(
        commandMenuCommandsComponentSelector,
        'command-menu',
      );

      return {
        commandMenu,
        isCommandMenuOpened,
        commandMenuCommands,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
  return { result };
};

describe('useCommandMenu', () => {
  it('should open and close the command menu', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.openCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(true);

    act(() => {
      result.current.commandMenu.closeCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(false);
  });

  it('should toggle the command menu', () => {
    const { result } = renderHooks();

    expect(result.current.isCommandMenuOpened).toBe(false);

    act(() => {
      result.current.commandMenu.toggleCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(true);

    act(() => {
      result.current.commandMenu.toggleCommandMenu();
    });

    expect(result.current.isCommandMenuOpened).toBe(false);
  });

  it('onItemClick', () => {
    const { result } = renderHooks();
    const onClickMock = jest.fn();

    act(() => {
      result.current.commandMenu.onItemClick(onClickMock, '/test');
    });

    expect(result.current.isCommandMenuOpened).toBe(true);
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
