import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FeatureFlagKey } from '~/generated/graphql';

export type TabVisibilityConfig = {
  ifMobile: boolean;
  ifDesktop: boolean;
  ifInRightDrawer: boolean;
  ifFeaturesDisabled: FeatureFlagKey[];
  ifRequiredObjectsInactive: CoreObjectNameSingular[];
  ifRelationsMissing: string[];
  ifNoReadPermission?: boolean;
  ifNoReadPermissionObject?: CoreObjectNameSingular;
};
