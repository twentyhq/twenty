import { atom } from 'jotai';

export const abmLoadingState = atom<boolean>(false);

export const abmErrorState = atom<string | null>(null);
