import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity.constant';
import { formatDateByGranularity } from '@/page-layout/widgets/graph/utils/formatDateByGranularity';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { formatToShortNumber } from '~/utils/format/formatToShortNumber';

type FormatDimensionValueParams = {
  value: unknown;
  fieldMetadata: FieldMetadataItem;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
  subFieldName?: string;
};

const normalizeMultiSelectValue = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return [value];
  }

  const trimmed = value.trim();
  const isPostgresArrayFormat =
    trimmed.startsWith('{') && trimmed.endsWith('}');

  if (!isPostgresArrayFormat) {
    return [value];
  }

  const content = trimmed.slice(1, -1);
  return content ? content.split(',') : [];
};

export const formatDimensionValue = ({
  value,
  fieldMetadata,
  dateGranularity = GRAPH_DEFAULT_DATE_GRANULARITY as ObjectRecordGroupByDateGranularity,
  subFieldName,
}: FormatDimensionValueParams): string => {
  if (!isDefined(value)) {
    return t`Not Set`;
  }

  switch (fieldMetadata.type) {
    case FieldMetadataType.SELECT: {
      const selectedOption = fieldMetadata.options?.find(
        (option) => option.value === value,
      );
      return selectedOption?.label ?? String(value);
    }

    case FieldMetadataType.MULTI_SELECT: {
      const values = normalizeMultiSelectValue(value);

      return values
        .map((value) => {
          const option = fieldMetadata.options?.find(
            (option) => option.value === value,
          );
          return option?.label ?? String(value);
        })
        .join(', ');
    }

    case FieldMetadataType.BOOLEAN: {
      return value === true ? t`Yes` : t`No`;
    }

    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME: {
      // TODO: granularity will be passed from the graph configuration when implemented
      if (
        dateGranularity ===
          ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK ||
        dateGranularity ===
          ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR ||
        dateGranularity ===
          ObjectRecordGroupByDateGranularity.QUARTER_OF_THE_YEAR
      ) {
        return String(value);
      }
      return formatDateByGranularity(new Date(String(value)), dateGranularity);
    }

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.CURRENCY: {
      if (
        fieldMetadata.type === FieldMetadataType.CURRENCY &&
        subFieldName === 'currencyCode'
      ) {
        if (!isNonEmptyString(value)) {
          return t`Not Set`;
        }

        return String(value);
      }
      const numericValue = typeof value === 'number' ? value : Number(value);
      if (isNaN(numericValue)) {
        return String(value);
      }
      return formatToShortNumber(numericValue);
    }

    default:
      return String(value);
  }
};
