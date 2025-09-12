import { v4 } from 'uuid';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { generateNewSelectOptionLabel } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOptionLabel';
import { getNextThemeColor } from 'twenty-ui/theme';
import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/compute-option-value-from-label.utils';

export const generateNewSelectOption = (
  options: FieldMetadataItemOption[],
  name?:string
): FieldMetadataItemOption => {
  const newOptionLabel = name ?? generateNewSelectOptionLabel(options);
  return {
    color: getNextThemeColor(options[options.length - 1]?.color),
    id: v4(),
    label: newOptionLabel,
    position: options.length,
    value: computeOptionValueFromLabel(newOptionLabel),
  };
};
