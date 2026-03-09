import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { createContext } from 'react';

export const CommandConfigContext = createContext<CommandMenuItemConfig | null>(
  null,
);
