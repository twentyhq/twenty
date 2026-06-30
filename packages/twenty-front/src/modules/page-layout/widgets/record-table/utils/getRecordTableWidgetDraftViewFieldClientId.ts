import { type RecordTableWidgetDraftViewField } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { isDefined } from 'twenty-shared/utils';

type RecordTableWidgetDraftViewFieldIdentity = Pick<
  RecordTableWidgetDraftViewField,
  'id' | 'clientRecordFieldId'
>;

export const getRecordTableWidgetDraftViewFieldClientId = (
  field: RecordTableWidgetDraftViewFieldIdentity,
): string => {
  if (isDefined(field.id)) {
    return field.id;
  }

  if (isDefined(field.clientRecordFieldId)) {
    return field.clientRecordFieldId;
  }

  return '';
};
