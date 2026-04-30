import { atom } from 'jotai';

import { BankConnection } from '../types/banking.types';

export const bankConnectionsState = atom<BankConnection[]>([]);

export const bankingLoadingState = atom<boolean>(false);

export const selectedBankConnectionIdState = atom<string | null>(null);

export const bankingFilterState = atom<string>('all');
