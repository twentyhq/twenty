import { type CommandMenuItemConfig } from '@/action-menu/actions/types/CommandMenuItemConfig';
import { createContext } from 'react';

export const CommandMenuItemConfigContext =
  createContext<CommandMenuItemConfig | null>(null);
