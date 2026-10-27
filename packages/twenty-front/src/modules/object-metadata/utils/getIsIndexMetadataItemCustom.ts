import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';

export const getIsIndexMetadataItemCustom = (
  indexMetadataItem: {
    applicationId?: string | null;
    isSystemSideEffect?: boolean | null;
  },
  workspaceCustomApplicationId?: string | null,
) =>
  getIsMetadataItemCustom(indexMetadataItem, workspaceCustomApplicationId) &&
  indexMetadataItem.isSystemSideEffect !== true;
