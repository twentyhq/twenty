import { atom } from 'jotai';

import { DealData } from '../types/sales.types';

export const dealsState = atom<DealData[]>([]);

export const salesExecutionLoadingState = atom<boolean>(false);

export const selectedDealIdState = atom<string | null>(null);

export const salesExecutionFilterState = atom<string>('all');
