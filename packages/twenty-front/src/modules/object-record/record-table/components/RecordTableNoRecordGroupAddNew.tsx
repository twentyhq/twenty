import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { isRecordTableCreateDisabled } from '@/object-record/record-table/utils/isRecordTableCreateDisabled';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconPlus } from 'twenty-ui/display';

export const RecordTableNoRecordGroupAddNew = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const { openDraftInSidePanel } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const handleButtonClick = useCallback(() => {
    openDraftInSidePanel({
      position: 'last',
    });
  }, [openDraftInSidePanel]);

  if (hasAnySoftDeleteFilterOnView) {
    return null;
  }

  if (!hasObjectUpdatePermissions) {
    return null;
  }

  if (isRecordTableCreateDisabled(objectMetadataItem)) {
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
