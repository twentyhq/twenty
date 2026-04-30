import { atom } from 'jotai';

import { StockItem } from '../types/inventory.types';

export const stockItemsState = atom<StockItem[]>([]);

export const inventoryLoadingState = atom<boolean>(false);

export const selectedStockItemIdState = atom<string | null>(null);
