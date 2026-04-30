import { atom } from 'jotai';

import { TargetAccountData } from '../types/abm.types';

export const abmAccountsState = atom<TargetAccountData[]>([]);

export const abmLoadingState = atom<boolean>(false);

export const abmSelectedAccountIdState = atom<string | null>(null);

export const abmFilterState = atom<string>('all');
