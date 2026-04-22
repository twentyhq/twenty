import {
  AggregateOperations,
  definePageLayout,
  ObjectRecordGroupByDateGranularity,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { EXTERNAL_CONTRIBUTORS_COUNTER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/front-components/external-contributors-counter.front-component';
import {
  MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PULL_REQUEST_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/pull-request/objects/pull-request.object';
import {
  PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/pull-request-review/objects/pull-request-review.object';

export const PR_ACTIVITY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  'a8d2f1c4-7b69-4e3a-8c5d-9f6b1a3e7c2d';

const THIS_MONTH_RELATIVE = 'THIS_1_MONTH;;UTC;;SUNDAY;;';

export default definePageLayout({
  universalIdentifier: PR_ACTIVITY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'PR Activity',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: 'b3e9c2a1-4d68-4f7b-9c25-1e3a5b7c9d11',
      title: 'PR Activity',
      position: 0,
      icon: 'IconChartLine',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: 'f1a2b3c4-d5e6-4789-a0b1-c2d3e4f5a6b1',
          title: 'PRs Merged This Month',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 4 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'PRs Merged',
            color: 'green',
            displayDataLabel: false,
            timezone: 'UTC',
            firstDayOfTheWeek: 0,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier:
                    MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER,
                  operand: 'IS_RELATIVE',
                  value: THIS_MONTH_RELATIVE,
                  type: 'DATE_TIME',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: 'f1a2b3c4-d5e6-4789-a0b1-c2d3e4f5a6b2',
          title: 'PR Reviews This Month',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, column: 4, rowSpan: 2, columnSpan: 4 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'Reviews',
            color: 'blue',
            displayDataLabel: false,
            timezone: 'UTC',
            firstDayOfTheWeek: 0,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier:
                    REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
                  operand: 'IS_RELATIVE',
                  value: THIS_MONTH_RELATIVE,
                  type: 'DATE_TIME',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: 'f1a2b3c4-d5e6-4789-a0b1-c2d3e4f5a6b3',
          title: 'External Contributors This Month',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, column: 8, rowSpan: 2, columnSpan: 4 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              EXTERNAL_CONTRIBUTORS_COUNTER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: 'c1f2a3b4-d5e6-4789-a0b1-c2d3e4f5a6b7',
          title: 'PRs Merged per Month',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 2, column: 0, rowSpan: 8, columnSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER,
            primaryAxisDateGranularity:
              ObjectRecordGroupByDateGranularity.MONTH,
            displayDataLabel: false,
            displayLegend: false,
            color: 'green',
            layout: 'VERTICAL',
            timezone: 'UTC',
            firstDayOfTheWeek: 0,
          },
        },
        {
          universalIdentifier: 'd2e3f4a5-b6c7-4890-a1b2-c3d4e5f6a7b8',
          title: 'PR Reviews per Month',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 2, column: 6, rowSpan: 8, columnSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
            primaryAxisDateGranularity:
              ObjectRecordGroupByDateGranularity.MONTH,
            displayDataLabel: false,
            displayLegend: false,
            color: 'blue',
            layout: 'VERTICAL',
            timezone: 'UTC',
            firstDayOfTheWeek: 0,
          },
        },
      ],
    },
  ],
});
