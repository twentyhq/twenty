import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { t } from '@lingui/core/macro';

export const getDisplayFormatLabel = (
  displayFormat: FieldDateDisplayFormat,
) => {
  switch (displayFormat) {
    case FieldDateDisplayFormat.CUSTOM:
      return t`Custom`;
    case FieldDateDisplayFormat.RELATIVE:
      return t`Relative`;
    case FieldDateDisplayFormat.USER_SETTINGS:
      return t`Default`;
    default:
      return '';
  }
};
