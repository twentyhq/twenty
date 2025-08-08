import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export type FeatureFlagMap = Record<`${FeatureFlagKey}`, boolean>;
