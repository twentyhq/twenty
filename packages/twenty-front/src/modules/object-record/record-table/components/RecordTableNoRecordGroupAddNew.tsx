import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useAssignRecordsToStore } from '@/object-record/record-table/virtualization/hooks/useAssignRecordsToStore';
import { useLoadRecordsToVirtualRows } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsToVirtualRows';
import { hasAlreadyLoadedDataUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyLoadedDataUpToRealIndexComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';

export const RecordTableNoRecordGroupAddNew = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const hasAnySoftDeleteFilterOnView = useRecoilComponentValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const hasAlreadyLoadDataUpToRealIndexCallbackState =
    useRecoilComponentCallbackState(
      hasAlreadyLoadedDataUpToRealIndexComponentState,
    );

  const { loadRecordsToVirtualRows } = useLoadRecordsToVirtualRows();
  const { assignRecordsToStore } = useAssignRecordsToStore();

  const handleButtonClick = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const createdRecord = await createNewIndexRecord({
          position: 'last',
        });

        const hasAlreadyLoadedDataUpToRealIndex = getSnapshotValue(
          snapshot,
          hasAlreadyLoadDataUpToRealIndexCallbackState,
        );

        if (isDefined(hasAlreadyLoadedDataUpToRealIndex)) {
          assignRecordsToStore({ records: [createdRecord] });

          loadRecordsToVirtualRows({
            records: [createdRecord],
            startingRealIndex: hasAlreadyLoadedDataUpToRealIndex,
          });
        }
      },
    [
      createNewIndexRecord,
      hasAlreadyLoadDataUpToRealIndexCallbackState,
      assignRecordsToStore,
      loadRecordsToVirtualRows,
    ],
  );

  if (hasAnySoftDeleteFilterOnView) {
    return null;
  }

  if (!hasObjectUpdatePermissions) {
    return null;
  }

  return (
    <RecordTableActionRow
      onClick={handleButtonClick}
      LeftIcon={IconPlus}
      text={t`Add New`}
    />
  );
};
