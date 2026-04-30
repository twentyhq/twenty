import { atom } from 'jotai';

import { CoachingSessionData } from '../types/coaching.types';

export const coachingSessionsState = atom<CoachingSessionData[]>([]);

export const salesCoachingLoadingState = atom<boolean>(false);

export const selectedCoachingSessionIdState = atom<string | null>(null);

export const salesCoachingFilterState = atom<string>('all');
