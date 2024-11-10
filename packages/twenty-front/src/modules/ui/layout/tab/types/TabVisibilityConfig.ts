import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FeatureFlagKey } from '@/workspace/types/FeatureFlagKey';

export type TabVisibilityConfig = {
  ifMobile: boolean;
  ifDesktop: boolean;
  ifInRightDrawer: boolean;
  ifFeaturesDisabled: FeatureFlagKey[];
  ifRequiredObjectsInactive: CoreObjectNameSingular[];
  ifRelationsMissing: string[];
};
