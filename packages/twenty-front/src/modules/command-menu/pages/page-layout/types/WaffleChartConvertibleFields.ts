import {
  type GraphOrderBy,
  type ObjectRecordGroupByDateGranularity,
} from '~/generated/graphql';

export type WaffleChartConvertibleFields = {
  groupByFieldMetadataId?: string;
  groupBySubFieldName?: string | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
  orderBy?: GraphOrderBy | null;
};
