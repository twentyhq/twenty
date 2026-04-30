import { atom } from 'jotai';

import { PurchaseOrderData } from '../types/trade.types';

export const purchaseOrdersState = atom<PurchaseOrderData[]>([]);

export const tradeImportLoadingState = atom<boolean>(false);

export const selectedPurchaseOrderIdState = atom<string | null>(null);

export const tradeImportFilterState = atom<string>('all');
