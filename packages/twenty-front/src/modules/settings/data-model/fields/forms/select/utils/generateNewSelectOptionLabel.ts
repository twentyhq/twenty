import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';

export const generateNewSelectOptionLabel = (
  values: Pick<FieldMetadataItemOption, 'label'>[],
  iteration = 1,
): string => {
  const newOptionLabel = `Option ${values.length + iteration}`;
  const labelExists = values.some((value) => value.label === newOptionLabel);

  return labelExists
    ? generateNewSelectOptionLabel(values, iteration + 1)
    : newOptionLabel;
};
