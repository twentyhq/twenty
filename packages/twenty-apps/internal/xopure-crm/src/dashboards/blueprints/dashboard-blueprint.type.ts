export type DashboardGridPosition = {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
};

export type DashboardGraphWidgetBlueprint = {
  title: string;
  type: 'GRAPH';
  objectNameSingular: string;
  gridPosition: DashboardGridPosition;
  configuration:
    | {
        configurationType: 'AGGREGATE_CHART';
        aggregateFieldName: string;
        aggregateOperation: string;
        label?: string;
        displayDataLabel?: boolean;
        prefix?: string;
        suffix?: string;
        filter?: unknown;
      }
    | {
        configurationType: 'PIE_CHART';
        aggregateFieldName: string;
        aggregateOperation: string;
        groupByFieldName: string;
        orderBy?: string;
        displayDataLabel?: boolean;
        showCenterMetric?: boolean;
        displayLegend?: boolean;
        hideEmptyCategory?: boolean;
        color?: string;
        description?: string;
        filter?: unknown;
      }
    | {
        configurationType: 'LINE_CHART';
        aggregateFieldName: string;
        aggregateOperation: string;
        primaryAxisGroupByFieldName: string;
        primaryAxisOrderBy?: string;
        axisNameDisplay?: string;
        displayDataLabel?: boolean;
        displayLegend?: boolean;
        color?: string;
        description?: string;
        filter?: unknown;
        timezone?: string;
        firstDayOfTheWeek?: number;
      };
};

export type DashboardRecordTableViewFieldBlueprint = {
  fieldName: string;
  position: number;
  size: number;
  isVisible?: boolean;
};

export type DashboardRecordTableWidgetBlueprint = {
  title: string;
  type: 'RECORD_TABLE';
  objectNameSingular: string;
  gridPosition: DashboardGridPosition;
  view: {
    name: string;
    icon: string;
    position?: number;
    fields: DashboardRecordTableViewFieldBlueprint[];
  };
};

export type DashboardWidgetBlueprint =
  | DashboardGraphWidgetBlueprint
  | DashboardRecordTableWidgetBlueprint;

export type DashboardTabBlueprint = {
  key: string;
  title: string;
  position: number;
  widgets: DashboardWidgetBlueprint[];
};

export type DashboardBlueprint = {
  title: string;
  tabs: DashboardTabBlueprint[];
};
