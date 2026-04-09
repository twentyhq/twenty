import { DEFAULT_MESSAGE_THREAD_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultMessageThreadRecordPageLayoutId';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

export const DEFAULT_MESSAGE_THREAD_RECORD_PAGE_LAYOUT: PageLayout = {
  __typename: 'PageLayout',
  id: DEFAULT_MESSAGE_THREAD_RECORD_PAGE_LAYOUT_ID,
  name: 'Default Message Thread Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  tabs: [
    {
      __typename: 'PageLayoutTab',
      applicationId: '',
      id: 'message-thread-tab-home',
      title: 'Home',
      icon: 'IconHome',
      position: 100,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      pageLayoutId: DEFAULT_MESSAGE_THREAD_RECORD_PAGE_LAYOUT_ID,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      widgets: [
        {
          __typename: 'PageLayoutWidget',
          id: 'message-thread-widget-email-thread',
          pageLayoutTabId: 'message-thread-tab-home',
          title: 'Thread',
          type: WidgetType.EMAIL_THREAD,
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
            configurationType: WidgetConfigurationType.FIELDS,
            viewId: null,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ],
    },
  ],
};
