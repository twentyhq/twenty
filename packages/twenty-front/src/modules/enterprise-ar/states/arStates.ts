import { atom } from 'jotai';

import { Invoice } from '../types/ar.types';

export const invoicesState = atom<Invoice[]>([]);

export const arLoadingState = atom<boolean>(false);

export const selectedInvoiceIdState = atom<string | null>(null);
