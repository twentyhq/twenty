import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { normalizeVerticalListWidgetsInDraftPageLayout } from '@/page-layout/utils/normalizeVerticalListWidgetsInDraftPageLayout';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

describe('useCurrentPageLayout', () => {
  it('keeps persisted widget order in view mode and uses normalized draft order in edit mode', () => {
    const store = createStore();
    const timelineWidget = {
      ...makeWidget('timeline', 0),
      type: WidgetType.TIMELINE,
    };
    const fieldsWidget = makeWidget('fields', 1);
    const persistedPageLayout = {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Record Page',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: 'object-metadata-id',
      tabs: [makeTab('vertical-list-tab', [timelineWidget, fieldsWidget])],
    } as PageLayout;

    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      persistedPageLayout,
    );
    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      normalizeVerticalListWidgetsInDraftPageLayout(
        toDraftPageLayout(persistedPageLayout),
      ),
    );

    const wrapper = ({ children }: { children: ReactNode }) => (
      <PageLayoutTestWrapper
        store={store}
        layoutType={PageLayoutType.RECORD_PAGE}
      >
        {children}
      </PageLayoutTestWrapper>
    );

    const { result } = renderHook(() => useCurrentPageLayout(), { wrapper });

    expect(
      result.current.currentPageLayout?.tabs[0].widgets.map(
        (widget) => widget.id,
      ),
    ).toEqual(['timeline', 'fields']);

    act(() => {
      store.set(isLayoutCustomizationModeEnabledState.atom, true);
    });

    expect(
      result.current.currentPageLayout?.tabs[0].widgets.map(
        (widget) => widget.id,
      ),
    ).toEqual(['fields', 'timeline']);
  });
});
