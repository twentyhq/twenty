import { type FieldMetadataDefaultOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export function transformEnumValue(options?: FieldMetadataDefaultOption[]) {
  return options?.map((option) => {
    if (/^\d/.test(option.value)) {
      return {
        ...option,
        value: `_${option.value}`,
      };
    }

    return option;
  });
}
