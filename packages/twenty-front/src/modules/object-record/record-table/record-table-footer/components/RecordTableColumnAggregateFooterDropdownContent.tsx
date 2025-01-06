import { useDropdown } from '@/dropdown/hooks/useDropdown';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterDropdownSubmenuContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateDropdownSubmenuContent';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { RecordTableColumnAggregateFooterMenuContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterMenuContent';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOption';
import { STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/standardAggregateOperationOptions';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';

export const RecordTableColumnAggregateFooterDropdownContent = () => {
  const { currentContentId, fieldMetadataId } = useDropdown({
    context: RecordTableColumnAggregateFooterDropdownContext,
  });

  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const fieldMetadata = objectMetadataItem.fields.find(
    (field) => field.id === fieldMetadataId,
  );

  const availableAggregateOperations =
    getAvailableAggregateOperationsForFieldMetadataType({
      fieldMetadataType: fieldMetadata?.type,
    });

  switch (currentContentId) {
    case 'moreAggregateOperationOptions': {
      const aggregateOperations = availableAggregateOperations.filter(
        (aggregateOperation) =>
          !STANDARD_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation),
      );

      return (
        <RecordTableColumnAggregateFooterDropdownSubmenuContent
          aggregateOperations={aggregateOperations}
          title="More options"
        />
      );
    }
    case 'countAggregateOperationsOptions': {
      const aggregateOperations = availableAggregateOperations.filter(
        (aggregateOperation) =>
          COUNT_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation),
      );
      return (
        <RecordTableColumnAggregateFooterDropdownSubmenuContent
          aggregateOperations={aggregateOperations}
          title="Count"
        />
      );
    }
    case 'percentAggregateOperationsOptions': {
      const aggregateOperations = availableAggregateOperations.filter(
        (aggregateOperation) =>
          PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(aggregateOperation),
      );
      return (
        <RecordTableColumnAggregateFooterDropdownSubmenuContent
          aggregateOperations={aggregateOperations}
          title="Percent"
        />
      );
    }
    default:
      return <RecordTableColumnAggregateFooterMenuContent />;
  }
};
