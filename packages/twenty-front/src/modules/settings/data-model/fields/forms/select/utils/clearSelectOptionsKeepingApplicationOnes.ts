import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { keepDefaultSelectOptionsActive } from '@/settings/data-model/fields/forms/select/utils/keepDefaultSelectOptionsActive';

export const clearSelectOptionsKeepingApplicationOnes = ({
  options,
  applicationOptionIds,
  isDefaultOptionValue,
}: {
  options: FieldMetadataItemOption[];
  applicationOptionIds: ReadonlySet<string>;
  isDefaultOptionValue: (
    optionValue: FieldMetadataItemOption['value'],
  ) => boolean;
}): FieldMetadataItemOption[] =>
  keepDefaultSelectOptionsActive({
    options: options
      .filter((option) => applicationOptionIds.has(option.id))
      .map((option) => ({ ...option, isActive: false })),
    isDefaultOptionValue,
  });
