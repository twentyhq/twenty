import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from 'twenty-ui';

import { Command, CommandType } from '../types/Command';

export const COMMAND_MENU_COMMANDS: Command[] = [
  {
    id: 'go-to-people',
    to: '/objects/people',
    label: 'Ir para Pessoas',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'P',
    Icon: IconUser,
  },
  {
    id: 'go-to-companies',
    to: '/objects/companies',
    label: 'Ir para Empresas',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'C',
    Icon: IconBuildingSkyscraper,
  },
  {
    id: 'go-to-activities',
    to: '/objects/opportunities',
    label: 'Ir para Oportunidades',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'O',
    Icon: IconTargetArrow,
  },
  {
    id: 'go-to-settings',
    to: '/settings/profile',
    label: 'Ir para Configurações',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'S',
    Icon: IconSettings,
  },
  {
    id: 'go-to-tasks',
    to: '/objects/tasks',
    label: 'Ir para Tarefas',
    type: CommandType.Navigate,
    firstHotKey: 'G',
    secondHotKey: 'T',
    Icon: IconCheckbox,
  },
];
