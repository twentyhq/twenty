import { type CommandMenuItemConfig } from '@/command-menu-item/actions/types/CommandMenuItemConfig';
import { createContext } from 'react';

export const CommandMenuItemConfigContext =
  createContext<CommandMenuItemConfig | null>(null);
