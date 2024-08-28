import { getNextThemeColor } from 'twenty-ui';
import { v4 } from 'uuid';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { generateNewSelectOptionLabel } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOptionLabel';
import { getOptionValueFromLabel } from '@/settings/data-model/fields/forms/select/utils/getOptionValueFromLabel';

export const generateNewSelectOption = (
  options: FieldMetadataItemOption[],
): FieldMetadataItemOption => {
  const newOptionLabel = generateNewSelectOptionLabel(options);

  return {
    color: getNextThemeColor(options[options.length - 1]?.color),
    id: v4(),
    label: newOptionLabel,
    position: options.length,
    value: getOptionValueFromLabel(newOptionLabel),
  };
};
