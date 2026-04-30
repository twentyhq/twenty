import { atom } from 'jotai';

import { AssetData } from '../types/assets.types';

export const assetsState = atom<AssetData[]>([]);

export const itAssetManagementLoadingState = atom<boolean>(false);

export const selectedAssetIdState = atom<string | null>(null);

export const itAssetManagementFilterState = atom<string>('all');
