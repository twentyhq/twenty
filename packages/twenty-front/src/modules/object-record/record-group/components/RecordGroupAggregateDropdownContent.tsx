import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordGroupAggregateDropdownFieldsContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownFieldsContent';
import { RecordGroupAggregateDropdownOptionsContent } from '@/object-record/record-group/components/RecordGroupAggregateDropdownOptionsContent';
import { RECORD_GROUP_AGGREGATE_FIELDS_PAGE_ID } from '@/object-record/record-group/constants/RecordGroupAggregateFieldsPageId';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { DATE_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/dateAggregateOperationOptions';
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
      operations: DATE_AGGREGATE_OPERATION_OPTIONS,
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
        <Dropdown.Section>
          {pages.map((page) => (
            <Dropdown.ActionItem key={page.id} page={page.id}>
              {page.title}
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Section>
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
      <Dropdown.Page id={RECORD_GROUP_AGGREGATE_FIELDS_PAGE_ID}>
        <RecordGroupAggregateDropdownFieldsContent
          objectMetadataItem={objectMetadataItem}
        />
      </Dropdown.Page>
    </>
  );
};
