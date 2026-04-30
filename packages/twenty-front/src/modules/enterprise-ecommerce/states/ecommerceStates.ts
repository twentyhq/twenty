import { atom } from 'jotai';

import { OrderData } from '../types/ecommerce.types';

export const ordersState = atom<OrderData[]>([]);

export const ecommerceLoadingState = atom<boolean>(false);

export const selectedOrderIdState = atom<string | null>(null);
