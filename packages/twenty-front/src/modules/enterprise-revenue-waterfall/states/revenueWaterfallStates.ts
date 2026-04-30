import { atom } from 'jotai';

import { ARRBreakdownData } from '../types/revenue.types';

export const arrBreakdownState = atom<ARRBreakdownData[]>([]);

export const revenueWaterfallLoadingState = atom<boolean>(false);

export const selectedArrPeriodIdState = atom<string | null>(null);

export const revenueWaterfallFilterState = atom<string>('all');
