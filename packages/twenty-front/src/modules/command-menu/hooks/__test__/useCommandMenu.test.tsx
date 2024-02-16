import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuCommandsState } from '@/command-menu/states/commandMenuCommandsState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandType } from '@/command-menu/types/Command';

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
      const [commandMenuCommands, setCommandMenuCommands] = useRecoilState(
        commandMenuCommandsState,
      );

      return {
        commandMenu,
        isCommandMenuOpened,
        commandMenuCommands,
        setCommandMenuCommands,
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

  it('should add commands to the menu', () => {
    const { result } = renderHooks();

    expect(
      result.current.commandMenuCommands.find((cmd) => cmd.label === 'Test'),
    ).toBeUndefined();

    act(() => {
      result.current.commandMenu.addToCommandMenu([
        { label: 'Test', id: 'test', to: '/test', type: CommandType.Navigate },
      ]);
    });

    expect(
      result.current.commandMenuCommands.find((cmd) => cmd.label === 'Test'),
    ).toBeDefined();
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

  it('should setToInitialCommandMenu command menu', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.setToInitialCommandMenu();
    });

    expect(result.current.commandMenuCommands.length).toBe(5);
  });
});
