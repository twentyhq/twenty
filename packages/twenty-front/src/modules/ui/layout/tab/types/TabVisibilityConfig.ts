import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FeatureFlagKey } from '@/workspace/types/FeatureFlagKey';

export type TabVisibilityConfig = {
  onMobile: boolean;
  onDesktop: boolean;
  inRightDrawer: boolean;
  requiresFeatures: FeatureFlagKey[];
  requiredObjectsNotActive: CoreObjectNameSingular[];
  requiresRelations: string[];
  ifCurrentObjectIsNotIn: CoreObjectNameSingular[];
};
