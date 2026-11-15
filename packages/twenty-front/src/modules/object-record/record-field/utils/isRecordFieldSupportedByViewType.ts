import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { ViewType } from '@/views/types/ViewType';

// The list layout renders one entry per field metadata, so an extra column would show as an unscoped duplicate
const VIEW_TYPES_WITH_EXTRA_COLUMNS = [
  ViewType.TABLE,
  ViewType.KANBAN,
  ViewType.CALENDAR,
];

export const isRecordFieldSupportedByViewType = ({
  recordField,
  viewType,
}: {
  recordField: Pick<RecordField, 'isCanonical'>;
  viewType: ViewType;
}) =>
  isCanonicalRecordField(recordField) ||
  VIEW_TYPES_WITH_EXTRA_COLUMNS.includes(viewType);
