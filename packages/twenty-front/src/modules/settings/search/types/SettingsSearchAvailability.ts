import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type PermissionFlagType } from '~/generated-metadata/graphql';

export type SettingsSearchAvailability = {
  permissionFlagMap: Record<PermissionFlagType, boolean>;
  featureFlagsMap: Record<string, boolean>;
  isBillingEnabled: boolean;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'namePlural' | 'labelPlural' | 'labelSingular'
  >[];
};
