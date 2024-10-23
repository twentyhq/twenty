import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
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

  it('should setObjectsInCommandMenu command menu', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.commandMenu.setObjectsInCommandMenu([]);
    });

    expect(result.current.commandMenuCommands.length).toBe(1);

    act(() => {
      result.current.commandMenu.setObjectsInCommandMenu([
        {
          id: 'b88745ce-9021-4316-a018-8884e02d05ca',
          nameSingular: 'task',
          namePlural: 'tasks',
          labelSingular: 'Task',
          labelPlural: 'Tasks',
          description: 'A task',
          icon: 'IconCheckbox',
          isCustom: false,
          isRemote: false,
          isActive: true,
          isSystem: false,
          createdAt: '2024-09-12T20:23:46.041Z',
          updatedAt: '2024-09-13T08:36:53.426Z',
          labelIdentifierFieldMetadataId:
            'ab7901eb-43e1-4dc7-8f3b-cdee2857eb9a',
          imageIdentifierFieldMetadataId: null,
          fields: [],
          indexMetadatas: [],
        },
      ]);
    });

    expect(result.current.commandMenuCommands.length).toBe(2);
  });
});
