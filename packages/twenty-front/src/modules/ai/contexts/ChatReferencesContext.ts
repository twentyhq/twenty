import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { createContext } from 'react';

export const ChatReferencesContext = createContext<ChatReferenceMatch[]>([]);
