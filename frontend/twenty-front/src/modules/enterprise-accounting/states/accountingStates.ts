import { atom } from 'jotai';

import { AccountData } from '../types/accounting.types';

export const accountsState = atom<AccountData[]>([]);

export const accountingLoadingState = atom<boolean>(false);

export const selectedAccountIdState = atom<string | null>(null);
