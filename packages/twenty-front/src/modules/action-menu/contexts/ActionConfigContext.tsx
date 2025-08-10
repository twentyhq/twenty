import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { createContext } from 'react';

export const ActionConfigContext = createContext<ActionConfig | null>(null);
