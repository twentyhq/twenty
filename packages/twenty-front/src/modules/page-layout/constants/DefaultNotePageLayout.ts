import { DEFAULT_NOTE_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultPageLayoutId';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { PageLayoutType, WidgetType } from '~/generated/graphql';

/**
 * Default Note PageLayout.
 * Minimal layout: Fields, Timeline, Files
 */
export const DEFAULT_NOTE_PAGE_LAYOUT: PageLayout = {
  __typename: 'PageLayout',
  id: DEFAULT_NOTE_PAGE_LAYOUT_ID,
  name: 'Default Note Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  tabs: [
    // Fields tab (position 100)
    {
      __typename: 'PageLayoutTab',
      id: 'note-tab-fields',
      title: 'Fields',
      position: 100,
      layoutMode: 'vertical-list',
      selfDisplayMode: 'pinned-left',
      pageLayoutId: DEFAULT_NOTE_PAGE_LAYOUT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          id: 'note-widget-fields',
          pageLayoutTabId: 'note-tab-fields',
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
          configuration: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ],
    },
    // Timeline tab (position 200)
    {
      __typename: 'PageLayoutTab',
      id: 'note-tab-timeline',
      title: 'Timeline',
      position: 200,
      layoutMode: 'vertical-list',
      pageLayoutId: DEFAULT_NOTE_PAGE_LAYOUT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          id: 'note-widget-timeline',
          pageLayoutTabId: 'note-tab-timeline',
          title: 'Timeline',
          type: WidgetType.TIMELINE,
          objectMetadataId: null,
          gridPosition: {
            __typename: 'GridPosition',
            row: 0,
            column: 0,
            rowSpan: 6,
            columnSpan: 12,
          },
          configuration: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ],
    },
    // Files tab (position 300)
    {
      __typename: 'PageLayoutTab',
      id: 'note-tab-files',
      title: 'Files',
      position: 300,
      layoutMode: 'vertical-list',
      pageLayoutId: DEFAULT_NOTE_PAGE_LAYOUT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          id: 'note-widget-files',
          pageLayoutTabId: 'note-tab-files',
          title: 'Files',
          type: WidgetType.FILES,
          objectMetadataId: null,
          gridPosition: {
            __typename: 'GridPosition',
            row: 0,
            column: 0,
            rowSpan: 6,
            columnSpan: 12,
          },
          configuration: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ],
    },
  ],
};
