import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/feature-flag-keys';

export type FeatureFlagMap = Record<`${FeatureFlagKey}`, boolean>;
