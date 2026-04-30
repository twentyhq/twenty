import { atom } from 'jotai';

import { AccountHealthData } from '../types/cs.types';

export const accountHealthState = atom<AccountHealthData[]>([]);

export const customerSuccessLoadingState = atom<boolean>(false);

export const selectedAccountHealthIdState = atom<string | null>(null);

export const customerSuccessFilterState = atom<string>('all');
