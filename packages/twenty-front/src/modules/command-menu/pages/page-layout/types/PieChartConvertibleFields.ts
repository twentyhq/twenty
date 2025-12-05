import {
  type GraphOrderBy,
  type ObjectRecordGroupByDateGranularity,
} from '~/generated/graphql';

export type PieChartConvertibleFields = {
  groupByFieldMetadataId?: string;
  groupBySubFieldName?: string | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
  orderBy?: GraphOrderBy | null;
};
