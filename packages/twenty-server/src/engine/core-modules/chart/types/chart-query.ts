import { ChartQueryMeasure } from 'src/modules/charts/standard-objects/chart.workspace-entity';

export interface ChartQuery {
  sourceObjectMetadataId?: string;
  target?: {
    relationFieldMetadataIds?: string[];
    measureFieldMetadataId?: string;
    measure?: ChartQueryMeasure;
  };
  groupBy?: {
    relationFieldMetadataIds?: string[];
    measureFieldMetadataId?: string;
    measure?: ChartQueryMeasure;
    groups?: { upperLimit: number; lowerLimit: number }[];
    includeNulls?: boolean;
  };
}
