import { atom } from 'jotai';

import { ChallengeData } from '../types/gamification.types';

export const challengesState = atom<ChallengeData[]>([]);

export const gamificationLoadingState = atom<boolean>(false);

export const selectedChallengeIdState = atom<string | null>(null);

export const gamificationFilterState = atom<string>('all');
