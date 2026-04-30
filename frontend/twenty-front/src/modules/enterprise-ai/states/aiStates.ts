import { atom } from 'jotai';

import { AIAgentData } from '../types/ai.types';

export const aiAgentsState = atom<AIAgentData[]>([]);

export const aiLoadingState = atom<boolean>(false);

export const selectedAgentIdState = atom<string | null>(null);
