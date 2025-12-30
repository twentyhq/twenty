import { DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultWorkflowVersionPageLayoutId';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { PageLayoutType, WidgetType } from '~/generated/graphql';

/**
 * Default WorkflowVersion PageLayout.
 * Specialized layout for workflow version visualization with Fields and Flow tabs.
 */
export const DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT: PageLayout = {
  __typename: 'PageLayout',
  id: DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID,
  name: 'Default Workflow Version Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  defaultTabIdToFocusOnMobileAndSidePanel: 'workflow-version-tab-flow',
  tabs: [
    // Fields tab (position 100)
    {
      __typename: 'PageLayoutTab',
      id: 'workflow-version-tab-fields',
      title: 'Fields',
      icon: 'IconList',
      position: 100,
      layoutMode: 'vertical-list',
      pageLayoutId: DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          id: 'workflow-version-widget-fields',
          pageLayoutTabId: 'workflow-version-tab-fields',
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
      id: 'workflow-version-tab-flow',
      title: 'Flow',
      icon: 'IconSettings',
      position: 200,
      layoutMode: 'canvas',
      pageLayoutId: DEFAULT_WORKFLOW_VERSION_PAGE_LAYOUT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          id: 'workflow-version-widget-flow',
          pageLayoutTabId: 'workflow-version-tab-flow',
          title: 'Flow',
          type: WidgetType.WORKFLOW_VERSION,
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
