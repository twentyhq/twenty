import { atom } from 'jotai';

import { TenantData } from '../types/saas.types';

export const saasTenantsState = atom<TenantData[]>([]);

export const saasPlatformLoadingState = atom<boolean>(false);

export const selectedSaasTenantIdState = atom<string | null>(null);

export const saasPlatformFilterState = atom<string>('all');
