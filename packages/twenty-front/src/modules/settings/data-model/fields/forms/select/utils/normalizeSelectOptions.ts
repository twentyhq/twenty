import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { DEFAULT_SELECT_OPTION_COLOR } from 'twenty-shared/constants';
import { isFieldMetadataOptionActive, isTagColor } from 'twenty-shared/utils';

type SelectOptionWithOptionalColor = Omit<FieldMetadataItemOption, 'color'> & {
  color?: string | null;
};

export const normalizeSelectOptions = (
  options: readonly SelectOptionWithOptionalColor[],
): FieldMetadataItemOption[] =>
  options
    .map((option) => ({
      ...option,
      color: isTagColor(option.color)
        ? option.color
        : DEFAULT_SELECT_OPTION_COLOR,
    }))
    .sort(
      (optionA, optionB) =>
        Number(!isFieldMetadataOptionActive(optionA)) -
          Number(!isFieldMetadataOptionActive(optionB)) ||
        optionA.position - optionB.position,
    )
    .map((option, position) => ({ ...option, position }));
