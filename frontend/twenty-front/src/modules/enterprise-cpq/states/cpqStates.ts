import { atom } from 'jotai';

import { QuoteData } from '../types/cpq.types';

export const quotesState = atom<QuoteData[]>([]);

export const cpqLoadingState = atom<boolean>(false);

export const selectedQuoteIdState = atom<string | null>(null);

export const cpqFilterState = atom<string>('all');
