import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type FormatDimensionValueParams = {
  value: unknown;
  fieldMetadata: FieldMetadataItem;
};

export const formatDimensionValue = ({
  value,
  fieldMetadata,
}: FormatDimensionValueParams): string => {
  if (!isDefined(value)) {
    return '';
  }

  switch (fieldMetadata.type) {
    case FieldMetadataType.SELECT: {
      const selectedOption = fieldMetadata.options?.find(
        (option) => option.value === value,
      );
      return selectedOption?.label ?? String(value);
    }

    case FieldMetadataType.MULTI_SELECT: {
      if (Array.isArray(value)) {
        return value
          .map((val) => {
            const option = fieldMetadata.options?.find(
              (opt) => opt.value === val,
            );
            return option?.label ?? String(val);
          })
          .join(', ');
      }
      return String(value);
    }

    case FieldMetadataType.BOOLEAN: {
      return value === true ? 'Yes' : 'No';
    }

    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME: {
      return new Date(String(value)).toLocaleString();
    }

    default:
      return String(value);
  }
};
