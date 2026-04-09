import { type FeatureFlagKey } from 'twenty-shared/types';

export type FeatureFlagMap = Record<`${FeatureFlagKey}`, boolean>;
