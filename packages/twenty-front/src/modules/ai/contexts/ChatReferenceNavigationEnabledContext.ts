import { createContext } from 'react';

// Chat reference chips link into the reader's own workspace, so navigation has
// to be turned off wherever a chat from another workspace is displayed.
export const ChatReferenceNavigationEnabledContext = createContext(true);
