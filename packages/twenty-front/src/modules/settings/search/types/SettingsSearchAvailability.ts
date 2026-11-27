import { type PermissionFlagType } from '~/generated-metadata/graphql';

export type SettingsSearchAvailability = {
  permissionFlagMap: Record<PermissionFlagType, boolean>;
  featureFlagsMap: Record<string, boolean>;
  isBillingEnabled: boolean;
};
