import { atom } from 'jotai';

import { Tenant } from '../types/billing.types';

export const billingTenantsState = atom<Tenant[]>([]);

export const billingLoadingState = atom<boolean>(false);

export const selectedTenantIdState = atom<string | null>(null);

export const billingFilterState = atom<string>('all');
