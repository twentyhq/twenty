import { DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowRunPageLayoutId';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { PageLayoutType, WidgetType } from '~/generated/graphql';

/**
 * Default WorkflowRun PageLayout.
 * Specialized layout for workflow run visualization with Fields and Flow tabs.
 */
export const DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT: PageLayout = {
  __typename: 'PageLayout',
  id: DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID,
  name: 'Default Workflow Run Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  defaultTabIdToFocusOnMobileAndSidePanel: 'workflow-run-tab-flow',
  tabs: [
    // Fields tab (position 100)
    {
      __typename: 'PageLayoutTab',
      id: 'workflow-run-tab-fields',
      title: 'Fields',
      position: 100,
      layoutMode: 'vertical-list',
      icon: 'IconList',
      pageLayoutId: DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          id: 'workflow-run-widget-fields',
          pageLayoutTabId: 'workflow-run-tab-fields',
          title: 'Fields',
          type: WidgetType.FIELDS,
          objectMetadataId: null,
          gridPosition: {
            __typename: 'GridPosition',
            row: 0,
            column: 0,
            rowSpan: 12,
            columnSpan: 12,
          },
          configuration: {
            __typename: 'FieldsConfiguration',
            configurationType: 'FIELDS',
            sections: [],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ],
    },
    // Flow tab (position 200)
    {
      __typename: 'PageLayoutTab',
      id: 'workflow-run-tab-flow',
      title: 'Flow',
      position: 200,
      layoutMode: 'canvas',
      icon: 'IconSettings',
      pageLayoutId: DEFAULT_WORKFLOW_RUN_PAGE_LAYOUT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          id: 'workflow-run-widget-flow',
          pageLayoutTabId: 'workflow-run-tab-flow',
          title: 'Flow',
          type: WidgetType.WORKFLOW_RUN,
          objectMetadataId: null,
          gridPosition: {
            __typename: 'GridPosition',
            row: 0,
            column: 0,
            rowSpan: 12,
            columnSpan: 12,
          },
          configuration: {
            __typename: 'FieldsConfiguration',
            configurationType: 'FIELDS',
            sections: [],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ],
    },
  ],
};
