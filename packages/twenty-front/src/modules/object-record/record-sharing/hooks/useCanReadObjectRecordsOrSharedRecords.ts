import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isShareableObjectMetadataItem } from '@/object-record/record-sharing/utils/isShareableObjectMetadataItem';
import {
  FeatureFlagKey,
  ObjectSharingReach,
} from '~/generated-metadata/graphql';

// A record shared by name reaches people whose role cannot read its object,
// so a direct link must still be fetched; the server returns nothing when
// the record was not shared with them
export const useCanReadObjectRecordsOrSharedRecords = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'isSystem' | 'readability' | 'sharingReach'
  >,
): boolean => {
  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  const isRecordLevelSharingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
  );
  // The server stops admitting records shared by name once the gate is bypassed
  const isRecordShareGateBypassed = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_SHARE_GATE_BYPASS_ENABLED,
  );

  return (
    objectPermissions.canReadObjectRecords ||
    (isRecordLevelSharingEnabled &&
      !isRecordShareGateBypassed &&
      isShareableObjectMetadataItem(objectMetadataItem) &&
      objectMetadataItem.sharingReach === ObjectSharingReach.WORKSPACE)
  );
};
