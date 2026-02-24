import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { useLoadRecordsToVirtualRows } from '@/object-record/record-table/virtualization/hooks/useLoadRecordsToVirtualRows';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
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

  const hasAnySoftDeleteFilterOnView = useRecoilComponentSelectorValueV2(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const totalNumberOfRecordsToVirtualize = useRecoilComponentValueV2(
    totalNumberOfRecordsToVirtualizeComponentState,
  );

  const { loadRecordsToVirtualRows } = useLoadRecordsToVirtualRows();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const handleButtonClick = useCallback(async () => {
    const createdRecord = await createNewIndexRecord({
      position: 'last',
    });

    upsertRecordsInStore({ partialRecords: [createdRecord] });

    if (isDefined(totalNumberOfRecordsToVirtualize)) {
      loadRecordsToVirtualRows({
        records: [createdRecord],
        startingRealIndex: totalNumberOfRecordsToVirtualize,
      });
    }
  }, [
    createNewIndexRecord,
    upsertRecordsInStore,
    loadRecordsToVirtualRows,
    totalNumberOfRecordsToVirtualize,
  ]);

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
