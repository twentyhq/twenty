import { useCancelLayoutCustomization } from '@/layout-customization/hooks/useCancelLayoutCustomization';
import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

const mockExitLayoutCustomizationMode = jest.fn();

jest.mock(
  '@/layout-customization/hooks/useExitLayoutCustomizationMode',
  () => ({
    useExitLayoutCustomizationMode: () => ({
      exitLayoutCustomizationMode: mockExitLayoutCustomizationMode,
    }),
  }),
);

const PAGE_LAYOUT_ID = 'page-layout-id';

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useCancelLayoutCustomization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('restores the persisted order in the draft', () => {
    const store = createStore();
    const timelineWidget = {
      ...makeWidget('timeline', 0),
      type: WidgetType.TIMELINE,
    };
    const fieldsWidget = makeWidget('fields', 1);
    const persistedPageLayout = {
      id: PAGE_LAYOUT_ID,
      name: 'Record Page',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: 'object-metadata-id',
      tabs: [makeTab('vertical-list-tab', [timelineWidget, fieldsWidget])],
    } as PageLayout;

    store.set(activeCustomizationPageLayoutIdsState.atom, [PAGE_LAYOUT_ID]);
    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      persistedPageLayout,
    );

    const { result } = renderHook(() => useCancelLayoutCustomization(), {
      wrapper: getWrapper(store),
    });

    act(() => {
      result.current.cancel();
    });

    expect(
      store
        .get(
          pageLayoutPersistedComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_ID,
          }),
        )
        ?.tabs[0].widgets.map((widget) => widget.id),
    ).toEqual(['timeline', 'fields']);
    expect(
      store
        .get(
          pageLayoutDraftComponentState.atomFamily({
            instanceId: PAGE_LAYOUT_ID,
          }),
        )
        .tabs[0].widgets.map((widget) => widget.id),
    ).toEqual(['timeline', 'fields']);
    expect(mockExitLayoutCustomizationMode).toHaveBeenCalledTimes(1);
  });
});
