import { useDropdown } from '@/dropdown/hooks/useDropdown';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { RecordTableColumnAggregateFooterDropdownSubmenuContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateDropdownSubmenuContent';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { RecordTableColumnAggregateFooterMenuContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterMenuContent';
import { BOOLEAN_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/booleanAggregateOperationOptions';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { DATE_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/dateAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/standardAggregateOperationOptions';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';

import { useLingui } from '@lingui/react/macro';

export const RecordTableColumnAggregateFooterDropdownContent = () => {
  const { t } = useLingui();
  const { currentContentId, fieldMetadataType } = useDropdown({
    context: RecordTableColumnAggregateFooterDropdownContext,
  });

  const availableAggregateOperations =
    getAvailableAggregateOperationsForFieldMetadataType({
      fieldMetadataType: fieldMetadataType,
    });

  switch (currentContentId) {
    case 'moreAggregateOperationOptions': {
      const aggregateOperations = availableAggregateOperations.filter(
        (aggregateOperation): aggregateOperation is AGGREGATE_OPERATIONS =>
          !STANDARD_AGGREGATE_OPERATION_OPTIONS.includes(
            aggregateOperation as AGGREGATE_OPERATIONS,
          ),
      );

      return (
        <RecordTableColumnAggregateFooterDropdownSubmenuContent
          aggregateOperations={aggregateOperations}
          title={t`More options`}
        />
      );
    }
    case 'countAggregateOperationsOptions': {
      const aggregateOperations = availableAggregateOperations.filter(
        (aggregateOperation): aggregateOperation is AGGREGATE_OPERATIONS =>
          COUNT_AGGREGATE_OPERATION_OPTIONS.includes(
            aggregateOperation as AGGREGATE_OPERATIONS,
          ),
      );
      return (
        <RecordTableColumnAggregateFooterDropdownSubmenuContent
          aggregateOperations={aggregateOperations}
          title={t`Count`}
        />
      );
    }
    case 'percentAggregateOperationsOptions': {
      const aggregateOperations = availableAggregateOperations.filter(
        (aggregateOperation): aggregateOperation is AGGREGATE_OPERATIONS =>
          PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(
            aggregateOperation as AGGREGATE_OPERATIONS,
          ),
      );
      return (
        <RecordTableColumnAggregateFooterDropdownSubmenuContent
          aggregateOperations={aggregateOperations}
          title={t`Percent`}
        />
      );
    }
    case 'booleanAggregateOperationsOptions': {
      const aggregateOperations = availableAggregateOperations.filter(
        (aggregateOperation): aggregateOperation is AGGREGATE_OPERATIONS =>
          BOOLEAN_AGGREGATE_OPERATION_OPTIONS.includes(
            aggregateOperation as AGGREGATE_OPERATIONS,
          ),
      );
      return (
        <RecordTableColumnAggregateFooterDropdownSubmenuContent
          aggregateOperations={aggregateOperations}
          title={t`Boolean`}
        />
      );
    }
    case 'datesAggregateOperationsOptions': {
      const aggregateOperations = availableAggregateOperations.filter(
        (aggregateOperation): aggregateOperation is DATE_AGGREGATE_OPERATIONS =>
          DATE_AGGREGATE_OPERATION_OPTIONS.includes(
            aggregateOperation as DATE_AGGREGATE_OPERATIONS,
          ),
      );
      return (
        <RecordTableColumnAggregateFooterDropdownSubmenuContent
          aggregateOperations={aggregateOperations}
          title={t`Date`}
        />
      );
    }
    default:
      return <RecordTableColumnAggregateFooterMenuContent />;
  }
};
