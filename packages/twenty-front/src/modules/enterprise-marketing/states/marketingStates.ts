import { atom } from 'jotai';

import { CampaignData } from '../types/marketing.types';

export const campaignsState = atom<CampaignData[]>([]);

export const marketingLoadingState = atom<boolean>(false);

export const selectedCampaignIdState = atom<string | null>(null);

export const marketingFilterState = atom<string>('all');
