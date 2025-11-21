import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';

export type FillDateGapsResult = {
  data: GroupByRawResult[];
  wasTruncated: boolean;
};
