import { useEffect } from 'react';
import { Decorator } from '@storybook/react';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandType } from '@/command-menu/types/Command';
import { IconCheckbox, IconNotes } from '@/ui/display/icon';

export const WrapCommandMenuStory: Decorator = (Story) => {
  const { addToCommandMenu, setToIntitialCommandMenu, toggleCommandMenu } =
    useCommandMenu();

  useEffect(() => {
    setToIntitialCommandMenu();
    addToCommandMenu([
      {
        id: 'create-task',
        to: '',
        label: 'Create Task',
        type: CommandType.Create,
        Icon: IconCheckbox,
        onCommandClick: () => console.log('create task click'),
      },
      {
        id: 'create-note',
        to: '',
        label: 'Create Note',
        type: CommandType.Create,
        Icon: IconNotes,
        onCommandClick: () => console.log('create note click'),
      },
    ]);
    toggleCommandMenu();
  }, [addToCommandMenu, setToIntitialCommandMenu, toggleCommandMenu]);

  return <Story />;
};
