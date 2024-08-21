interface DataExplorerQueryChildJoin {
  type: 'join';
  children: DataExplorerQueryChild;
  fieldMetadataId?: string;
  measure?: 'COUNT';
}

interface DataExplorerQueryChildSelect {
  type: 'select';
  children: DataExplorerQueryChild;
  fieldMetadataId?: string;
  measure?: 'AVG' | 'MAX' | 'MIN' | 'SUM';
}

interface DataExplorerQueryGroupBy {
  type: 'groupBy';
  groupBy?: boolean;
  groups?: { upperLimit: number; lowerLimit: number }[];
  includeNulls?: boolean;
}

interface DataExplorerQuerySort {
  type: 'sort';
  sortBy?: 'ASC' | 'DESC';
}

type DataExplorerQueryChild =
  | DataExplorerQueryChildJoin
  | DataExplorerQueryChildSelect
  | DataExplorerQueryGroupBy
  | DataExplorerQuerySort;

export interface DataExplorerQuery {
  sourceObjectMetadataId?: string;
  children: DataExplorerQueryChild[];
}
