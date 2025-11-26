import {
  type GraphOrderBy,
  type ObjectRecordGroupByDateGranularity,
} from '~/generated/graphql';

export type BarLineChartConvertibleFields = {
  primaryAxisGroupByFieldMetadataId?: string;
  primaryAxisGroupBySubFieldName?: string | null;
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity | null;
  primaryAxisOrderBy?: GraphOrderBy | null;
};
