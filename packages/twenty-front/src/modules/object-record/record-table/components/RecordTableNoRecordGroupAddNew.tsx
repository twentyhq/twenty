import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { hasRecordTableFetchedAllRecordsComponentState } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentState';
import { hasAlreadyFetchedUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyFetchedUpToRealIndexComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';

export const RecordTableNoRecordGroupAddNew = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const hasRecordTableFetchedAllRecords = useRecoilComponentValue(
    hasRecordTableFetchedAllRecordsComponentState,
  );

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

  const hasAlreadyFetchedUpToRealIndexCallbackState =
    useRecoilComponentCallbackState(
      hasAlreadyFetchedUpToRealIndexComponentState,
    );

  const recordIdByRealIndexCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilyState,
    );

  const handleButtonClick = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const createdRecord = await createNewIndexRecord({
          position: 'last',
        });

        const hasAlreadyFetchedUpToRealIndex = getSnapshotValue(
          snapshot,
          hasAlreadyFetchedUpToRealIndexCallbackState,
        );

        if (isDefined(hasAlreadyFetchedUpToRealIndex)) {
          set(
            recordIdByRealIndexCallbackState({
              realIndex: hasAlreadyFetchedUpToRealIndex,
            }),
            createdRecord.id,
          );

          set(
            hasAlreadyFetchedUpToRealIndexCallbackState,
            hasAlreadyFetchedUpToRealIndex + 1,
          );
        }
      },
    [
      createNewIndexRecord,
      recordIdByRealIndexCallbackState,
      hasAlreadyFetchedUpToRealIndexCallbackState,
    ],
  );

  if (hasAnySoftDeleteFilterOnView) {
    return null;
  }

  if (!hasObjectUpdatePermissions || !hasRecordTableFetchedAllRecords) {
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
