import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { RecordTableColumnAggregateFooterDropdownSubmenuContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateDropdownSubmenuContent';
import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { RecordTableColumnAggregateFooterMenuContent } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterMenuContent';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { DATE_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/dateAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/standardAggregateOperationOptions';
import { getAvailableAggregateOperationsForFieldMetadataType } from '@/object-record/record-table/record-table-footer/utils/getAvailableAggregateOperationsForFieldMetadataType';
import { useContext } from 'react';
import { Dropdown } from 'twenty-ui/components';

import { useLingui } from '@lingui/react/macro';

export const RecordTableColumnAggregateFooterDropdownContent = () => {
  const { t } = useLingui();
  const { fieldMetadataType } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );

  const availableAggregateOperations =
    getAvailableAggregateOperationsForFieldMetadataType({
      fieldMetadataType: fieldMetadataType,
    });

  const pages = [
    {
      id: 'moreAggregateOperationOptions',
      title: t`More options`,
      operations: availableAggregateOperations.filter(
        (operation) =>
          !STANDARD_AGGREGATE_OPERATION_OPTIONS.includes(
            operation as AggregateOperations,
          ),
      ),
    },
    {
      id: 'countAggregateOperationsOptions',
      title: t`Count`,
      operations: availableAggregateOperations.filter((operation) =>
        COUNT_AGGREGATE_OPERATION_OPTIONS.includes(
          operation as AggregateOperations,
        ),
      ),
    },
    {
      id: 'percentAggregateOperationsOptions',
      title: t`Percent`,
      operations: availableAggregateOperations.filter((operation) =>
        PERCENT_AGGREGATE_OPERATION_OPTIONS.includes(
          operation as AggregateOperations,
        ),
      ),
    },
    {
      id: 'datesAggregateOperationsOptions',
      title: t`Date`,
      operations: availableAggregateOperations.filter((operation) =>
        DATE_AGGREGATE_OPERATION_OPTIONS.includes(
          operation as DateAggregateOperations,
        ),
      ),
    },
  ];

  return (
    <>
      <Dropdown.Page id="root">
        <RecordTableColumnAggregateFooterMenuContent />
      </Dropdown.Page>
      {pages.map((page) => (
        <Dropdown.Page key={page.id} id={page.id}>
          <RecordTableColumnAggregateFooterDropdownSubmenuContent
            aggregateOperations={page.operations}
            title={page.title}
          />
        </Dropdown.Page>
      ))}
    </>
  );
};
