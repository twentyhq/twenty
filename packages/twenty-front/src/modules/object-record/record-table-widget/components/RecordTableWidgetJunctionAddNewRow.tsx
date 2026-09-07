import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { RecordTableWidgetRelationPickerDropdownContent } from '@/object-record/record-table-widget/components/RecordTableWidgetRelationPickerDropdownContent';
import { type RecordTableWidgetJunctionCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useCreateJunctionRecordFromTableWidget } from '@/object-record/record-table-widget/hooks/useCreateJunctionRecordFromTableWidget';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { logError } from '~/utils/logError';

type RecordTableWidgetJunctionAddNewRowProps = {
  dropdownId: string;
  junctionCreateThrough: RecordTableWidgetJunctionCreateThrough;
  targetRecordsFilter?: RecordGqlOperationFilter;
};

export const RecordTableWidgetJunctionAddNewRow = ({
  dropdownId,
  junctionCreateThrough,
  targetRecordsFilter = junctionCreateThrough.targetRecordsFilter,
}: RecordTableWidgetJunctionAddNewRowProps) => {
  const { closeDropdown } = useCloseDropdown();
  const { enqueueErrorSnackBar } = useSnackBar();

  const { objectMetadataItem: junctionObjectMetadataItem } =
    useObjectMetadataItemById({
      objectId: junctionCreateThrough.junctionObjectMetadataId,
    });

  const junctionObjectPermissions = useObjectPermissionsForObject(
    junctionCreateThrough.junctionObjectMetadataId,
  );

  const { createJunctionRecord } = useCreateJunctionRecordFromTableWidget({
    junctionCreateThrough,
  });

  // Linking an existing record only writes the junction object, so the
  // junction's own permissions gate the row rather than the target object's.
  if (
    isObjectMetadataReadOnly({
      objectPermissions: junctionObjectPermissions,
      objectMetadataItem: junctionObjectMetadataItem,
    })
  ) {
    return null;
  }

  const handleTargetRecordSelected = (targetRecordId: string) => {
    closeDropdown(dropdownId);
    createJunctionRecord(targetRecordId).catch((error) => {
      logError(error);
      enqueueErrorSnackBar({ message: t`Failed to add record` });
    });
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponentWidth="100%"
      clickableComponent={
        <RecordTableActionRow LeftIcon={IconPlus} text={t`Add New`} />
      }
      dropdownComponents={
        <RecordTableWidgetRelationPickerDropdownContent
          objectNameSingular={
            junctionCreateThrough.targetObjectMetadataNameSingular
          }
          recordsFilter={targetRecordsFilter}
          onRelationRecordSelected={handleTargetRecordSelected}
        />
      }
    />
  );
};
