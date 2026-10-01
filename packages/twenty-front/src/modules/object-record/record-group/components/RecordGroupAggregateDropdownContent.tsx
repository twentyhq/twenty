import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordGroupAggregateDropdownFieldsContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownFieldsContent';
import { RecordGroupAggregateDropdownMenuContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownMenuContent';
import { RecordGroupAggregateDropdownOptionsContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownOptionsContent';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { getAvailableFieldsIdsForAggregationFromObjectFields } from '@/object-record/utils/getAvailableFieldsIdsForAggregationFromObjectFields';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components/navigation';

type RecordGroupAggregateDropdownContentProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const RecordGroupAggregateDropdownContent = ({
  objectMetadataItem,
}: RecordGroupAggregateDropdownContentProps) => {
  const { readableFields } = objectMetadataItem;

  const pages = [
    {
      id: 'countAggregateOperationsOptions',
      title: t`Count`,
      operations: COUNT_AGGREGATE_OPERATION_OPTIONS,
    },
    {
      id: 'percentAggregateOperationsOptions',
      title: t`Percent`,
      operations: PERCENT_AGGREGATE_OPERATION_OPTIONS,
    },
    {
      id: 'datesAggregateOperationOptions',
      title: t`Date`,
      operations: [
        DateAggregateOperations.EARLIEST,
        DateAggregateOperations.LATEST,
      ],
    },
    {
      id: 'moreAggregateOperationOptions',
      title: t`More options`,
      operations: NON_STANDARD_AGGREGATE_OPERATION_OPTIONS,
    },
  ];

  return (
    <>
      <Dropdown.Page id="root">
        <RecordGroupAggregateDropdownMenuContent />
      </Dropdown.Page>
      {pages.map((page) => (
        <Dropdown.Page key={page.id} id={page.id}>
          <RecordGroupAggregateDropdownOptionsContent
            objectMetadataItem={objectMetadataItem}
            availableAggregations={getAvailableFieldsIdsForAggregationFromObjectFields(
              {
                fields: readableFields,
                targetAggregateOperations: page.operations,
              },
            )}
            title={page.title}
          />
        </Dropdown.Page>
      ))}
      <Dropdown.Page id="aggregateFields">
        <RecordGroupAggregateDropdownFieldsContent
          objectMetadataItem={objectMetadataItem}
        />
      </Dropdown.Page>
    </>
  );
};
