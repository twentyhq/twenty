import { atom } from 'jotai';

export const lastDiscardedDraftIdState = atom<string | undefined>(undefined);
lastDiscardedDraftIdState.debugLabel = 'lastDiscardedDraftIdState';
