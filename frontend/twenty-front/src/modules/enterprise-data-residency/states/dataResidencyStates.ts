import { atom } from 'jotai';

import { RegionData } from '../types/residency.types';

export const regionsState = atom<RegionData[]>([]);

export const dataResidencyLoadingState = atom<boolean>(false);

export const selectedRegionIdState = atom<string | null>(null);

export const dataResidencyFilterState = atom<string>('all');
