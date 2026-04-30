import { atom } from 'jotai';

import { FeatureFlag } from '../types/flags.types';

export const featureFlagsState = atom<FeatureFlag[]>([]);

export const featureFlagsLoadingState = atom<boolean>(false);

export const selectedFeatureFlagIdState = atom<string | null>(null);

export const featureFlagsFilterState = atom<string>('all');
