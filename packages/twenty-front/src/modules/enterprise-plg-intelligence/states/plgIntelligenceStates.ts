import { atom } from 'jotai';

import { PQLData } from '../types/plg.types';

export const pqlListState = atom<PQLData[]>([]);

export const plgIntelligenceLoadingState = atom<boolean>(false);

export const selectedPqlIdState = atom<string | null>(null);

export const plgIntelligenceFilterState = atom<string>('all');
