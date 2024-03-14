import { FeatureFlagKeys } from 'src/engine/features/feature-flag/feature-flag.entity';

export type FeatureFlagMap = Record<`${FeatureFlagKeys}`, boolean>;
