import { atom } from 'jotai';

import { FiscalCountryStats } from '../types/fiscal.types';

export const fiscalCountryStatsState = atom<FiscalCountryStats[]>([]);

export const fiscalLoadingState = atom<boolean>(false);

export const selectedFiscalCountryIdState = atom<string | null>(null);

export const fiscalFilterState = atom<string>('all');
