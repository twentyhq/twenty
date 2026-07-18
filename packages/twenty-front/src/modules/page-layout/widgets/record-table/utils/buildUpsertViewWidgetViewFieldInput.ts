import { type RecordTableWidgetDraftViewField } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { isDefined } from 'twenty-shared/utils';
import { type UpsertViewWidgetViewFieldInput } from '~/generated-metadata/graphql';

type RecordTableWidgetDraftViewFieldForUpsert = Pick<
  RecordTableWidgetDraftViewField,
  | 'aggregateOperation'
  | 'clientRecordFieldId'
  | 'fieldMetadataId'
  | 'id'
  | 'isVisible'
  | 'position'
  | 'size'
>;

export const buildUpsertViewWidgetViewFieldInput = (
  field: RecordTableWidgetDraftViewFieldForUpsert,
): UpsertViewWidgetViewFieldInput => {
  const aggregateOperation =
    field.aggregateOperation as UpsertViewWidgetViewFieldInput['aggregateOperation'];

  return {
    ...(isDefined(field.id) ? { viewFieldId: field.id } : {}),
    fieldMetadataId: field.fieldMetadataId,
    isVisible: field.isVisible,
    position: field.position,
    size: field.size,
    aggregateOperation: aggregateOperation ?? null,
  };
};
