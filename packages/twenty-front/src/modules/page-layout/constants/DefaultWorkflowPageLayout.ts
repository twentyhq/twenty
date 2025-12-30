import { DEFAULT_WORKFLOW_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowPageLayoutId';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { PageLayoutType, WidgetType } from '~/generated/graphql';

/**
 * Default Workflow PageLayout.
 * Specialized layout for workflow visualization with a single Flow tab.
 */
export const DEFAULT_WORKFLOW_PAGE_LAYOUT: PageLayout = {
  __typename: 'PageLayout',
  id: DEFAULT_WORKFLOW_PAGE_LAYOUT_ID,
  name: 'Default Workflow Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  tabs: [
    // Flow tab (position 100)
    {
      __typename: 'PageLayoutTab',
      id: 'workflow-tab-flow',
      title: 'Flow',
      position: 100,
      layoutMode: 'canvas',
      icon: 'IconSettings',
      pageLayoutId: DEFAULT_WORKFLOW_PAGE_LAYOUT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          id: 'workflow-widget-flow',
          pageLayoutTabId: 'workflow-tab-flow',
          title: 'Flow',
          type: WidgetType.WORKFLOW,
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
