import {
  type GraphOrderBy,
  type ObjectRecordGroupByDateGranularity,
} from '~/generated-metadata/graphql';

export type BarLineChartConvertibleFields = {
  aggregateFieldMetadataId?: string;
  primaryAxisGroupByFieldMetadataId?: string;
  primaryAxisGroupBySubFieldName?: string | null;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity | null;
  primaryAxisOrderBy?: GraphOrderBy | null;
  splitMultiValueFields?: boolean | null;
};
