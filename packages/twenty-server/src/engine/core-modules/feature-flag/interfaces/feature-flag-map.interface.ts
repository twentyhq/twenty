import { FeatureFlagKeys } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

export type FeatureFlagMap = Record<`${FeatureFlagKeys}`, boolean>;
