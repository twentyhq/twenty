import { atom } from 'jotai';

import { MobileSessionData } from '../types/mobile.types';

export const mobileSessionsState = atom<MobileSessionData[]>([]);

export const mobileNativeLoadingState = atom<boolean>(false);

export const selectedMobileSessionIdState = atom<string | null>(null);

export const mobileNativeFilterState = atom<string>('all');
