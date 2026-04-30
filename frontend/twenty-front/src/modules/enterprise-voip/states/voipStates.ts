import { atom } from 'jotai';

import { CallRecord } from '../types/voip.types';

export const callRecordsState = atom<CallRecord[]>([]);

export const voipLoadingState = atom<boolean>(false);

export const selectedCallIdState = atom<string | null>(null);
