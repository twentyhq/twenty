import { atom } from 'jotai';

import { ContractData } from '../types/clm.types';

export const contractsState = atom<ContractData[]>([]);

export const clmLoadingState = atom<boolean>(false);

export const selectedContractIdState = atom<string | null>(null);
