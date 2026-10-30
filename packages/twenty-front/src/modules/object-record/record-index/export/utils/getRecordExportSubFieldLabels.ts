import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES } from '@/settings/data-model/constants/CompositeFieldSubFieldLabelMessages';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { t } from '@lingui/core/macro';

export const getRecordExportSubFieldLabels = (type: FieldType) => {
  if (!isCompositeFieldType(type)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES[type]).map(
      ([name, message]) => [name, t(message)],
    ),
  );
};
