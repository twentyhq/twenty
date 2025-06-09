import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FeatureFlagKey } from '~/generated/graphql';

export type TabVisibilityConfig = {
  ifMobile: boolean;
  ifDesktop: boolean;
  ifInRightDrawer: boolean;
  ifFeaturesDisabled: FeatureFlagKey[];
  ifRequiredObjectsInactive: CoreObjectNameSingular[];
  ifRelationsMissing: string[];
};
