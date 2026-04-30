import { atom } from 'jotai';

import { PartnerData } from '../types/prm.types';

export const partnersState = atom<PartnerData[]>([]);

export const prmLoadingState = atom<boolean>(false);

export const selectedPartnerIdState = atom<string | null>(null);
