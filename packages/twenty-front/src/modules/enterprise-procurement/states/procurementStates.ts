import { atom } from 'jotai';

import { PurchaseRequest } from '../types/procurement.types';

export const purchaseRequestsState = atom<PurchaseRequest[]>([]);

export const procurementLoadingState = atom<boolean>(false);

export const selectedPurchaseRequestIdState = atom<string | null>(null);

export const procurementFilterState = atom<string>('all');
