import {
  type RecordTableWidgetDraftViewField,
  type RecordTableWidgetViewSnapshot,
} from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { getRecordTableWidgetDraftViewFieldClientId } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetDraftViewFieldClientId';

export const updateRecordTableWidgetViewFieldAggregateOperation = ({
  snapshot,
  viewFieldId,
  aggregateOperation,
}: {
  snapshot: RecordTableWidgetViewSnapshot;
  viewFieldId: string;
  aggregateOperation: RecordTableWidgetDraftViewField['aggregateOperation'];
}): RecordTableWidgetViewSnapshot => {
  const viewFieldIndex = snapshot.viewFields.findIndex((field) => {
    return getRecordTableWidgetDraftViewFieldClientId(field) === viewFieldId;
  });

  if (viewFieldIndex === -1) {
    return snapshot;
  }

  return {
    ...snapshot,
    viewFields: snapshot.viewFields.map((field, index) =>
      index === viewFieldIndex ? { ...field, aggregateOperation } : field,
    ),
  };
};
