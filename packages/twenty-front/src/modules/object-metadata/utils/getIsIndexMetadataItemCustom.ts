import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';

export const getIsIndexMetadataItemCustom = ({
  indexMetadataItem,
  workspaceCustomApplicationId,
}: {
  indexMetadataItem: {
    applicationId?: string | null;
    isSystemSideEffect?: boolean | null;
  };
  workspaceCustomApplicationId?: string | null;
}) =>
  getIsMetadataItemCustom(indexMetadataItem, workspaceCustomApplicationId) &&
  indexMetadataItem.isSystemSideEffect !== true;
