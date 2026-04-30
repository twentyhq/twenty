import { atom } from 'jotai';

import { ConversationData } from '../types/omnicanal.types';

export const conversationsState = atom<ConversationData[]>([]);

export const omnicanalLoadingState = atom<boolean>(false);

export const selectedConversationIdState = atom<string | null>(null);

export const omnicanalFilterState = atom<string>('all');
