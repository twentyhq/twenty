import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type RecordFieldColumnDescriptor } from '@/object-record/record-field/types/RecordFieldColumnDescriptor';
import { isDefined } from 'twenty-shared/utils';

export type AggregateColumn = {
  relationFieldName: string;
  aggregateGqlFieldName: string;
};

export const getAggregateColumns = ({
  recordFields,
  columnDescriptorByRecordFieldId,
}: {
  recordFields: Pick<RecordField, 'id'>[];
  columnDescriptorByRecordFieldId: Record<
    string,
    Pick<RecordFieldColumnDescriptor, 'aggregateTarget'> | undefined
  >;
}): AggregateColumn[] =>
  recordFields.flatMap(({ id }) => {
    const aggregateTarget =
      columnDescriptorByRecordFieldId[id]?.aggregateTarget;

    return isDefined(aggregateTarget)
      ? [
          {
            relationFieldName: aggregateTarget.relationFieldName,
            aggregateGqlFieldName: aggregateTarget.aggregateGqlFieldName,
          },
        ]
      : [];
  });
