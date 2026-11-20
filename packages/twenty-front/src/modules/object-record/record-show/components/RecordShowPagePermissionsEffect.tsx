import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRefreshRecordPermissions } from '@/object-record/record-sharing/hooks/useRefreshRecordPermissions';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useEffect } from 'react';

type RecordShowPagePermissionsEffectProps = {
  recordId: string;
  objectNameSingular: string;
};

export const RecordShowPagePermissionsEffect = ({
  recordId,
  objectNameSingular,
}: RecordShowPagePermissionsEffectProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { canUpdateAllRecords } = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const recordUpdatedAt = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    { recordId, fieldName: 'updatedAt' },
  );

  const { refreshRecordPermissions } = useRefreshRecordPermissions();

  useEffect(() => {
    if (canUpdateAllRecords) {
      return;
    }

    refreshRecordPermissions([
      { objectMetadataId: objectMetadataItem.id, recordId },
    ]);
  }, [
    canUpdateAllRecords,
    objectMetadataItem.id,
    recordId,
    recordUpdatedAt,
    refreshRecordPermissions,
  ]);

  return null;
};
