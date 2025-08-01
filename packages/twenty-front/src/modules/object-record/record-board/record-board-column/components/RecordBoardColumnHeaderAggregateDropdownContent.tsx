import { useDropdownContextStateManagement } from '@/dropdown-context-state-management/hooks/useDropdownContextStateManagement';
import { getReadRestrictedFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getReadRestrictedFieldMetadataIdsFromObjectPermissions';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { RecordBoardColumnHeaderAggregateDropdownFieldsContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownFieldsContent';
import { RecordBoardColumnHeaderAggregateDropdownMenuContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownMenuContent';
import { RecordBoardColumnHeaderAggregateDropdownOptionsContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownOptionsContent';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { getAvailableFieldsIdsForAggregationFromObjectFields } from '@/object-record/utils/getAvailableFieldsIdsForAggregationFromObjectFields';
import { t } from '@lingui/core/macro';

export const AggregateDropdownContent = () => {
  const { currentContentId, objectMetadataItem } =
    useDropdownContextStateManagement({
      context: RecordBoardColumnHeaderAggregateDropdownContext,
    });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const restrictedFieldMetadataIds =
    getReadRestrictedFieldMetadataIdsFromObjectPermissions({
      objectPermissions: [
        objectPermissionsByObjectMetadataId[objectMetadataItem.id],
      ],
      objectMetadataId: objectMetadataItem.id,
    });

  switch (currentContentId) {
    case 'countAggregateOperationsOptions': {
      const availableAggregations: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields({
          fields: objectMetadataItem.fields,
          targetAggregateOperations: COUNT_AGGREGATE_OPERATION_OPTIONS,
          restrictedFieldMetadataIds,
        });
      return (
        <RecordBoardColumnHeaderAggregateDropdownOptionsContent
          availableAggregations={availableAggregations}
          title="Count"
        />
      );
    }
    case 'percentAggregateOperationsOptions': {
      const availableAggregations: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields({
          fields: objectMetadataItem.fields,
          targetAggregateOperations: PERCENT_AGGREGATE_OPERATION_OPTIONS,
          restrictedFieldMetadataIds,
        });
      return (
        <RecordBoardColumnHeaderAggregateDropdownOptionsContent
          availableAggregations={availableAggregations}
          title="Percent"
        />
      );
    }
    case 'datesAggregateOperationOptions': {
      const datesAvailableAggregations: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields({
          fields: objectMetadataItem.fields,
          targetAggregateOperations: [
            DateAggregateOperations.EARLIEST,
            DateAggregateOperations.LATEST,
          ],
          restrictedFieldMetadataIds,
        });
      return (
        <RecordBoardColumnHeaderAggregateDropdownOptionsContent
          availableAggregations={datesAvailableAggregations}
          title={t`Date`}
        />
      );
    }
    case 'moreAggregateOperationOptions': {
      const availableAggregationsWithoutDates: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields({
          fields: objectMetadataItem.fields,
          targetAggregateOperations: NON_STANDARD_AGGREGATE_OPERATION_OPTIONS,
          restrictedFieldMetadataIds,
        });
      return (
        <RecordBoardColumnHeaderAggregateDropdownOptionsContent
          availableAggregations={availableAggregationsWithoutDates}
          title="More options"
        />
      );
    }
    case 'aggregateFields':
      return <RecordBoardColumnHeaderAggregateDropdownFieldsContent />;
    default:
      return <RecordBoardColumnHeaderAggregateDropdownMenuContent />;
  }
};
