import { FeatureFlagKeys } from 'src/core/feature-flag/feature-flag.entity';

export type FeatureFlagMap = Record<`${FeatureFlagKeys}`, boolean>;
