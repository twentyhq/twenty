import { RecordTableCellAggregateDisplay } from '@/object-record/record-column-aggregate/components/RecordTableCellAggregateDisplay';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellFieldDisplay = () => {
  const { recordField } = useContext(RecordTableCellContext);
  const { columnDescriptorByRecordFieldId } = useRecordIndexContextOrThrow();

  const aggregateTarget =
    columnDescriptorByRecordFieldId[recordField.id]?.aggregateTarget;

  if (isDefined(aggregateTarget)) {
    return (
      <RecordTableCellAggregateDisplay aggregateTarget={aggregateTarget} />
    );
  }

  return <FieldDisplay />;
};
