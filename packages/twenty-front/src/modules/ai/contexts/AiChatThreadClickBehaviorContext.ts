import { createContext } from 'react';

// 'side-panel' opens the Ask AI side panel on thread click; 'in-place'
// only switches the active thread, for surfaces that already render the
// conversation next to the list (expanded chat).
export type AiChatThreadClickBehavior = 'side-panel' | 'in-place';

export const AiChatThreadClickBehaviorContext =
  createContext<AiChatThreadClickBehavior>('side-panel');
