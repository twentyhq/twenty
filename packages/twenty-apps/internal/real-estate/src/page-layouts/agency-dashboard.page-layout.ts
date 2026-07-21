import {
  AggregateOperations,
  definePageLayout,
  PageLayoutTabLayoutMode,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import {
  PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PROPERTY_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PROPERTY_UNIVERSAL_IDENTIFIER,
} from '../objects/property.object';
import {
  SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SHOWING_UNIVERSAL_IDENTIFIER,
} from '../objects/showing.object';
import { LISTING_AGENT_ON_PROPERTY_ID } from '../fields/listing-agent-on-property.field';
import { AGENT_ON_SHOWING_ID } from '../fields/agent-on-showing.field';
import { BUYER_STAGE_FIELD_ID } from '../fields/opportunity-buyer-stage.field';

export const AGENCY_DASHBOARD_PAGE_LAYOUT_ID =
  'a5de312d-d97f-4dad-bce8-e8110f6b86c7';

const opportunityFields =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields;
const opportunityObjectId =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier;

// Chart-config values the SDK doesn't export as enums (passed as string literals).
const BAR = {
  layout: 'VERTICAL',
  primaryAxisOrderBy: 'FIELD_ASC',
  axisNameDisplay: 'NONE',
  color: 'auto',
  timezone: 'UTC',
  firstDayOfTheWeek: 1,
} as const;

export default definePageLayout({
  universalIdentifier: AGENCY_DASHBOARD_PAGE_LAYOUT_ID,
  name: 'Agency Overview',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: '62f7f9e3-75c9-4a60-9ae9-151b417a2c4c',
      title: 'Overview',
      position: 0,
      icon: 'IconChartBar',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: '7934653e-a3d4-47d6-a624-a7216a7e18ca',
          title: 'Portfolio value',
          type: 'GRAPH',
          objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PROPERTY_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.SUM,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: 1,
          },
        },
        {
          universalIdentifier: '30e59360-b245-480b-b74f-382ef7c19976',
          title: 'Pipeline value',
          type: 'GRAPH',
          objectUniversalIdentifier: opportunityObjectId,
          gridPosition: { row: 0, column: 3, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              opportunityFields.amount.universalIdentifier,
            aggregateOperation: AggregateOperations.SUM,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: 1,
          },
        },
        {
          universalIdentifier: 'b2a949ff-36ba-47d2-a3af-a0ac986745ca',
          title: 'Properties sold',
          type: 'GRAPH',
          objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, column: 6, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: 1,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier:
                    PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
                  operand: 'IS',
                  value: '["SOLD"]',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: '80f0d9e5-07d8-461c-9188-e6cd7beed9f5',
          title: 'Showings',
          type: 'GRAPH',
          objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, column: 9, rowSpan: 2, columnSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: 1,
          },
        },
        {
          universalIdentifier: '81baf0f8-1db9-4e60-be4f-a2304e56a714',
          title: 'Properties by status',
          type: 'GRAPH',
          objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 2, column: 0, rowSpan: 5, columnSpan: 6 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            groupByFieldMetadataUniversalIdentifier:
              PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
            displayLegend: true,
            timezone: 'UTC',
            firstDayOfTheWeek: 1,
          },
        },
        {
          universalIdentifier: '2c8597fb-ef1d-41cf-9788-3ff4c933b2b5',
          title: 'Pipeline by stage',
          type: 'GRAPH',
          objectUniversalIdentifier: opportunityObjectId,
          gridPosition: { row: 2, column: 6, rowSpan: 5, columnSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              opportunityFields.name.universalIdentifier,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              BUYER_STAGE_FIELD_ID,
            ...BAR,
          },
        },
        {
          universalIdentifier: '4f9c41e3-3871-43fc-bdb8-1f42fdfcaecb',
          title: 'Listings by agent',
          type: 'GRAPH',
          objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 7, column: 0, rowSpan: 5, columnSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              LISTING_AGENT_ON_PROPERTY_ID,
            ...BAR,
            primaryAxisOrderBy: 'VALUE_DESC',
          },
        },
        {
          universalIdentifier: '0018b8ef-abd0-4937-8c80-2b86805f4dc5',
          title: 'Showings by agent',
          type: 'GRAPH',
          objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 7, column: 6, rowSpan: 5, columnSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              AGENT_ON_SHOWING_ID,
            ...BAR,
            primaryAxisOrderBy: 'VALUE_DESC',
          },
        },
      ],
    },
  ],
});
