import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { RecordTableWidgetRelationPickerDropdownContent } from '@/object-record/record-table-widget/components/RecordTableWidgetRelationPickerDropdownContent';
import { type RecordTableWidgetJunctionCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useCreateJunctionRecordFromTableWidget } from '@/object-record/record-table-widget/hooks/useCreateJunctionRecordFromTableWidget';
import { RecordTableActionRow } from '@/object-record/record-table/record-table-row/components/RecordTableActionRow';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { t } from '@lingui/core/macro';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components/feedback';
import { Dropdown } from 'twenty-ui/components/navigation';
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
  const { enqueueToast } = useToast();

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

  // Linking only writes the junction object, so its permissions gate the row.
  if (
    isObjectMetadataReadOnly({
      objectPermissions: junctionObjectPermissions,
      objectMetadataItem: junctionObjectMetadataItem,
    })
  ) {
    return null;
  }

  const handleTargetRecordSelected = (targetRecordId: string) => {
    createJunctionRecord(targetRecordId).catch((error) => {
      logError(error);
      enqueueToast({ variant: 'error', children: t`Failed to add record` });
    });
  };

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger
        render={<div />}
        nativeButton={false}
        style={{ width: '100%' }}
      >
        <RecordTableActionRow LeftIcon={IconPlus} text={t`Add New`} />
      </Dropdown.Trigger>
      <DropdownContent align="start" width={GenericDropdownContentWidth.Medium}>
        <RecordTableWidgetRelationPickerDropdownContent
          objectNameSingular={
            junctionCreateThrough.targetObjectMetadataNameSingular
          }
          recordsFilter={targetRecordsFilter}
          onRelationRecordSelected={handleTargetRecordSelected}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
