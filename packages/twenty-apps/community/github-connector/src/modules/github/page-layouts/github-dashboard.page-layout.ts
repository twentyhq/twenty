import {
  AggregateOperations,
  definePageLayout,
  ObjectRecordGroupByDateGranularity,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';
import { TOP_PR_AUTHORS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/front-components/top-pr-authors.front-component';
import { TOP_REVIEWERS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/front-components/top-reviewers.front-component';
import {
  ISSUE_GITHUB_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  ISSUE_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  ISSUE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  ISSUE_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/issue/objects/issue.object';
import {
  MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PR_GITHUB_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PR_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PULL_REQUEST_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/pull-request/objects/pull-request.object';
import {
  PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/pull-request-review/objects/pull-request-review.object';

export const GITHUB_DASHBOARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  'a8d2f1c4-7b69-4e3a-8c5d-9f6b1a3e7c2d';

const THIS_WEEK_RELATIVE = 'THIS_1_WEEK;;UTC;;SUNDAY;;';

const COMMON = {
  timezone: 'UTC',
  firstDayOfTheWeek: 0,
};

const COL_1 = { column: 0, columnSpan: 3 } as const;
const COL_2 = { column: 3, columnSpan: 5 } as const;
const COL_3 = { column: 8, columnSpan: 4 } as const;

export default definePageLayout({
  universalIdentifier: GITHUB_DASHBOARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'GitHub Dashboard',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: 'b3e9c2a1-4d68-4f7b-9c25-1e3a5b7c9d11',
      title: 'GitHub Dashboard',
      position: 0,
      icon: 'IconBrandGithub',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: [
        {
          universalIdentifier: 'f1a2b3c4-d5e6-4789-a0b1-c2d3e4f5a6b1',
          title: 'PRs Merged This Week',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, ...COL_1, rowSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'PRs Merged',
            color: 'green',
            displayDataLabel: false,
            ...COMMON,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier:
                    MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER,
                  operand: 'IS_RELATIVE',
                  value: THIS_WEEK_RELATIVE,
                  type: 'DATE_TIME',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: 'f1a2b3c4-d5e6-4789-a0b1-c2d3e4f5a6b2',
          title: 'PR Reviews This Week',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 3, ...COL_1, rowSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'Reviews',
            color: 'blue',
            displayDataLabel: false,
            ...COMMON,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier:
                    REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
                  operand: 'IS_RELATIVE',
                  value: THIS_WEEK_RELATIVE,
                  type: 'DATE_TIME',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: '8d4e9d09-29b0-4925-8fcc-aedf5bcecb37',
          title: 'PRs Opened This Week',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 6, ...COL_1, rowSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'PRs Opened',
            color: 'purple',
            displayDataLabel: false,
            ...COMMON,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier:
                    PR_GITHUB_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
                  operand: 'IS_RELATIVE',
                  value: THIS_WEEK_RELATIVE,
                  type: 'DATE_TIME',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: '3c321867-0227-4535-81db-c64a6f673d86',
          title: 'Issues Opened This Week',
          type: 'GRAPH',
          objectUniversalIdentifier: ISSUE_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 9, ...COL_1, rowSpan: 3 },
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              ISSUE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            label: 'Issues Opened',
            color: 'orange',
            displayDataLabel: false,
            ...COMMON,
            filter: {
              recordFilters: [
                {
                  fieldMetadataUniversalIdentifier:
                    ISSUE_GITHUB_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
                  operand: 'IS_RELATIVE',
                  value: THIS_WEEK_RELATIVE,
                  type: 'DATE_TIME',
                },
              ],
            },
          },
        },
        {
          universalIdentifier: '704209be-9174-43a8-ae51-6b11fff20e22',
          title: 'PRs by State',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 12, ...COL_1, rowSpan: 6 },
          configuration: {
            configurationType: 'PIE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            groupByFieldMetadataUniversalIdentifier:
              PR_STATE_FIELD_UNIVERSAL_IDENTIFIER,
            displayLegend: true,
            showCenterMetric: true,
            hideEmptyCategory: true,
            ...COMMON,
          },
        },
        {
          universalIdentifier: 'c1f2a3b4-d5e6-4789-a0b1-c2d3e4f5a6b7',
          title: 'PRs Merged per Week',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 0, ...COL_2, rowSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER,
            primaryAxisDateGranularity:
              ObjectRecordGroupByDateGranularity.WEEK,
            displayDataLabel: false,
            displayLegend: false,
            color: 'green',
            layout: 'VERTICAL',
            omitNullValues: true,
            ...COMMON,
          },
        },
        {
          universalIdentifier: 'd2e3f4a5-b6c7-4890-a1b2-c3d4e5f6a7b8',
          title: 'PR Reviews per Week',
          type: 'GRAPH',
          objectUniversalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 6, ...COL_2, rowSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
            primaryAxisDateGranularity:
              ObjectRecordGroupByDateGranularity.WEEK,
            displayDataLabel: false,
            displayLegend: false,
            color: 'blue',
            layout: 'VERTICAL',
            omitNullValues: true,
            ...COMMON,
          },
        },
        {
          universalIdentifier: '6d03cbd1-ee03-4bf4-a3ac-143d03fa7fd9',
          title: 'Issues per Week',
          type: 'GRAPH',
          objectUniversalIdentifier: ISSUE_UNIVERSAL_IDENTIFIER,
          gridPosition: { row: 12, ...COL_2, rowSpan: 6 },
          configuration: {
            configurationType: 'BAR_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              ISSUE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataUniversalIdentifier:
              ISSUE_GITHUB_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
            primaryAxisDateGranularity:
              ObjectRecordGroupByDateGranularity.WEEK,
            secondaryAxisGroupByFieldMetadataUniversalIdentifier:
              ISSUE_STATE_FIELD_UNIVERSAL_IDENTIFIER,
            displayDataLabel: false,
            displayLegend: true,
            color: 'orange',
            layout: 'VERTICAL',
            omitNullValues: true,
            ...COMMON,
          },
        },
        {
          universalIdentifier: '7b3e9c4a-1d52-4f8b-ac76-3e5b8d2f1a9c',
          title: 'Top PR Authors',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 0, ...COL_3, rowSpan: 9 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              TOP_PR_AUTHORS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
        {
          universalIdentifier: '5e4a8c1d-7f93-4b2e-9d6c-3a8f1b5e7d4c',
          title: 'Top Reviewers',
          type: 'FRONT_COMPONENT',
          gridPosition: { row: 9, ...COL_3, rowSpan: 9 },
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              TOP_REVIEWERS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
