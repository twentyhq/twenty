import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { t } from '@lingui/core/macro';

export const generateNewSelectOptionLabel = (
  values: Pick<FieldMetadataItemOption, 'label'>[],
  iteration = 1,
): string => {
  const newOptionLabel = t`Option ${values.length + iteration}`;
  const labelExists = values.some((value) => value.label === newOptionLabel);

  return labelExists
    ? generateNewSelectOptionLabel(values, iteration + 1)
    : newOptionLabel;
};
