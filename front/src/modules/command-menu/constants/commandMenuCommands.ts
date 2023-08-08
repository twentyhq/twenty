import { Command, CommandType } from '../types/Command';

export const commandMenuCommands: Command[] = [
  {
    to: '/people',
    label: 'Go to People',
    type: CommandType.Navigate,
    shortcuts: ['G', 'P'],
  },
  {
    to: '/companies',
    label: 'Go to Companies',
    type: CommandType.Navigate,
    shortcuts: ['G', 'C'],
  },
  {
    to: '/opportunities',
    label: 'Go to Opportunities',
    type: CommandType.Navigate,
    shortcuts: ['G', 'O'],
  },
  {
    to: '/settings/profile',
    label: 'Go to Settings',
    type: CommandType.Navigate,
    shortcuts: ['G', 'S'],
  },
  {
    to: '/tasks',
    label: 'Go to Tasks',
    type: CommandType.Navigate,
    shortcuts: ['G', 'T'],
  },
];
