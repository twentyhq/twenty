import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type View } from '@/views/types/View';
import { isDefined } from 'twenty-shared/utils';

export const isRecordFieldScoped = ({
  recordField,
  scopeView,
}: {
  recordField: Pick<RecordField, 'settings'>;
  scopeView: Pick<View, 'id'> | undefined;
}): boolean =>
  isDefined(scopeView) || isDefined(recordField.settings?.recordLimit);
