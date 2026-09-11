import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { parseThemeColor } from 'twenty-ui/utilities';

type SelectOptionWithOptionalColor = Omit<FieldMetadataItemOption, 'color'> & {
  color?: string | null;
};

export const normalizeSelectOptions = (
  options: readonly SelectOptionWithOptionalColor[],
): FieldMetadataItemOption[] =>
  options
    .map((option) => ({
      ...option,
      color: parseThemeColor(option.color),
    }))
    .sort((optionA, optionB) => optionA.position - optionB.position);
