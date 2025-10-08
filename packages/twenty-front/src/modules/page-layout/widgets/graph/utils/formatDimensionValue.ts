import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity.constant';
import { type ObjectRecordGroupByDateGranularity } from '@/page-layout/widgets/graph/types/ObjectRecordGroupByDateGranularity';
import { formatDateByGranularity } from '@/page-layout/widgets/graph/utils/formatDateByGranularity';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type FormatDimensionValueParams = {
  value: unknown;
  fieldMetadata: FieldMetadataItem;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
};

export const formatDimensionValue = ({
  value,
  fieldMetadata,
  dateGranularity = GRAPH_DEFAULT_DATE_GRANULARITY as ObjectRecordGroupByDateGranularity,
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
      return value === true ? t`Yes` : t`No`;
    }

    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME: {
      // TODO: granularity will be passed from the graph configuration when implemented
      return formatDateByGranularity(new Date(String(value)), dateGranularity);
    }

    default:
      return String(value);
  }
};
