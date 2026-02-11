import {
  type GraphOrderBy,
  type ObjectRecordGroupByDateGranularity,
} from '~/generated-metadata/graphql';

export type BarLineChartConvertibleFields = {
  primaryAxisGroupByFieldMetadataId?: string;
  primaryAxisGroupBySubFieldName?: string | null;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity | null;
  primaryAxisOrderBy?: GraphOrderBy | null;
};
