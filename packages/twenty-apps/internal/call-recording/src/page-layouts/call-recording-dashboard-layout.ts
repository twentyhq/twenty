import { PEOPLE_ON_CALL_RECORDING_ID } from 'src/fields/people-on-call-recording.field';
import { WORKSPACE_MEMBERS_ON_CALL_RECORDING_ID } from 'src/fields/workspace-members-on-call-recording.field';
import {
  CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/call-recording';
import { AggregateOperations, definePageLayout, ObjectRecordGroupByDateGranularity, PageLayoutTabLayoutMode } from 'twenty-sdk';

export const CALL_RECORDING_DASHBOARD_LAYOUT_UNIVERSAL_IDENTIFIER =
  '17ff2924-00c9-4105-ac4e-64c28cba781f';

export default definePageLayout({
  universalIdentifier: CALL_RECORDING_DASHBOARD_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Call Recording Insights',
  type: 'DASHBOARD',
  tabs: [
    {
      universalIdentifier: 'aa3398e8-b7e8-402f-9681-4cdc44fdd6d8',
      title: 'Overview',
      position: 0,
      icon: 'IconChartBar',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '1a04a308-5318-4f75-9b3a-4ee414750508',
          title: 'Total Calls',
          type: 'GRAPH',
          objectUniversalIdentifier:
            CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'Total Calls',
          },
        },
        {
          universalIdentifier: '26c8190f-ff63-45f8-9cd9-d8bfd1380cca',
          title: 'Calls per Person',
          type: 'GRAPH',
          objectUniversalIdentifier:
            CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, column: 3, rowSpan: 6, columnSpan: 4 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            groupByFieldMetadataUniversalIdentifier:
              PEOPLE_ON_CALL_RECORDING_ID,
            groupBySubFieldName: 'name.firstName',
            showCenterMetric: true,
            displayLegend: true,
            displayDataLabel: false,
            color: 'blue',
          },
        },
        {
          universalIdentifier: 'd3741561-e9ca-4dd2-8510-4f49d25911e5',
          title: 'Calls per Workspace Member',
          type: 'GRAPH',
          objectUniversalIdentifier:
            CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, column: 7, rowSpan: 6, columnSpan: 5 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              WORKSPACE_MEMBERS_ON_CALL_RECORDING_ID,
            primaryAxisGroupBySubFieldName: 'name.firstName',
            displayDataLabel: true,
            displayLegend: false,
            color: 'turquoise',
            layout: 'VERTICAL',
          },
        },
        {
          universalIdentifier: '7916f127-8f60-4226-a0b8-45632cf3cfe7',
          title: 'Calls Over Time',
          type: 'GRAPH',
          objectUniversalIdentifier:
            CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 6, column: 0, rowSpan: 6, columnSpan: 12 },
          configuration: {
            configurationType: 'LINE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
            primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
            displayDataLabel: false,
            displayLegend: false,
            color: 'purple',
          },
        },
      ],
    },
  ],
});
