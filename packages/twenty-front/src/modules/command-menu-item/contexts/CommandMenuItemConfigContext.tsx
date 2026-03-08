import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { createContext } from 'react';

export const CommandMenuItemConfigContext =
  createContext<CommandMenuItemConfig | null>(null);
