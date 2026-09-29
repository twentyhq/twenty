import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  PageLayoutWidgetVerticalListHeightBehavior,
  WidgetType,
} from '~/generated-metadata/graphql';

export const makeWidget = (
  id: string,
  index: number,
  tabId = 'tab-1',
): PageLayoutWidget =>
  ({
    id,
    pageLayoutTabId: tabId,
    title: id,
    isActive: true,
    type: WidgetType.FIELDS,
    configuration: { __typename: 'FieldsConfiguration' as const },
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }) as unknown as PageLayoutWidget;

// Hidden unless the workspace has the flag, which no test store sets. Fit
// content, since moves already skip a viewport-filling widget, flag or not.
export const makeFlagGatedWidget = (
  id: string,
  index: number,
  tabId = 'tab-1',
): PageLayoutWidget =>
  ({
    ...makeWidget(id, index, tabId),
    type: WidgetType.CHAT_THREADS,
    configuration: { __typename: 'ChatThreadsConfiguration' as const },
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
      heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
    },
  }) as unknown as PageLayoutWidget;

export const makeTab = (
  id: string,
  widgets: PageLayoutWidget[],
  position = 0,
  layoutMode: PageLayoutTabLayoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST,
  overrides?: Partial<PageLayoutTab>,
) => ({
  id,
  applicationId: '',
  universalIdentifier: id,
  isSystemSideEffect: false,
  title: id,
  isActive: true,
  position,
  layoutMode,
  pageLayoutId: '',
  widgets,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  ...overrides,
});

export const makeDraft = (
  tabs: ReturnType<typeof makeTab>[],
): DraftPageLayout => ({
  id: 'test-layout',
  name: 'Test Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  isFirstTabPinned: true,
  tabs,
});
