import { atom } from 'jotai';

import { WorkOrderData } from '../types/fsm.types';

export const workOrdersState = atom<WorkOrderData[]>([]);

export const fsmLoadingState = atom<boolean>(false);

export const selectedWorkOrderIdState = atom<string | null>(null);
