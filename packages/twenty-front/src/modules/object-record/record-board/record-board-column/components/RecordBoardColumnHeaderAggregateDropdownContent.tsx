import { useDropdown } from '@/dropdown/hooks/useDropdown';
import { RecordBoardColumnHeaderAggregateDropdownContext } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownContext';
import { RecordBoardColumnHeaderAggregateDropdownFieldsContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownFieldsContent';
import { RecordBoardColumnHeaderAggregateDropdownMenuContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownMenuContent';
import { RecordBoardColumnHeaderAggregateDropdownOptionsContent } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdownOptionsContent';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { getAvailableFieldsIdsForAggregationFromObjectFields } from '@/object-record/utils/getAvailableFieldsIdsForAggregationFromObjectFields';

export const AggregateDropdownContent = () => {
  const { currentContentId, objectMetadataItem } = useDropdown({
    context: RecordBoardColumnHeaderAggregateDropdownContext,
  });

  switch (currentContentId) {
    case 'countAggregateOperationsOptions': {
      const availableAggregations: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields(
          objectMetadataItem.fields,
          COUNT_AGGREGATE_OPERATION_OPTIONS,
        );
      return (
        <RecordBoardColumnHeaderAggregateDropdownOptionsContent
          availableAggregations={availableAggregations}
          title="Count"
        />
      );
    }
    case 'percentAggregateOperationsOptions': {
      const availableAggregations: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields(
          objectMetadataItem.fields,
          PERCENT_AGGREGATE_OPERATION_OPTIONS,
        );
      return (
        <RecordBoardColumnHeaderAggregateDropdownOptionsContent
          availableAggregations={availableAggregations}
          title="Percent"
        />
      );
    }
    case 'datesAggregateOperationOptions': {
      const datesAvailableAggregations: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields(
          objectMetadataItem.fields,
          [
            DATE_AGGREGATE_OPERATIONS.earliest,
            DATE_AGGREGATE_OPERATIONS.latest,
          ],
        );
      return (
        <RecordBoardColumnHeaderAggregateDropdownOptionsContent
          availableAggregations={datesAvailableAggregations}
          title="Dates"
        />
      );
    }
    case 'moreAggregateOperationOptions': {
      const availableAggregationsWithoutDates: AvailableFieldsForAggregateOperation =
        getAvailableFieldsIdsForAggregationFromObjectFields(
          objectMetadataItem.fields,
          NON_STANDARD_AGGREGATE_OPERATION_OPTIONS,
        );
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
