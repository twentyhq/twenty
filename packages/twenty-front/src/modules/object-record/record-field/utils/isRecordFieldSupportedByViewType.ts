import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { ViewType } from '@/views/types/ViewType';

// Extra columns are table-only: other layouts render one entry per field metadata
export const isRecordFieldSupportedByViewType = ({
  recordField,
  viewType,
}: {
  recordField: Pick<RecordField, 'isCanonical'>;
  viewType: ViewType;
}) => viewType === ViewType.TABLE || isCanonicalRecordField(recordField);
