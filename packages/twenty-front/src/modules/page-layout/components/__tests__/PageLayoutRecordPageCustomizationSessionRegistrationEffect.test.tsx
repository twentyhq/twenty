import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { PageLayoutRecordPageCustomizationSessionRegistrationEffect } from '@/page-layout/components/PageLayoutRecordPageCustomizationSessionRegistrationEffect';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { PageLayoutType, WidgetType } from '~/generated-metadata/graphql';

const PAGE_LAYOUT_ID = 'page-layout-id';

jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode');

const mockUseIsPageLayoutInEditMode =
  useIsPageLayoutInEditMode as jest.MockedFunction<
    typeof useIsPageLayoutInEditMode
  >;

const setupPageLayout = () => {
  const store = createStore();
  const timelineWidget = {
    ...makeWidget('timeline', 0),
    type: WidgetType.TIMELINE,
  };
  const fieldsWidget = makeWidget('fields', 1);
  const verticalListTab = makeTab('vertical-list-tab', [
    timelineWidget,
    fieldsWidget,
  ]);
  const persistedPageLayout = {
    id: PAGE_LAYOUT_ID,
    name: 'Record Page',
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataId: 'object-metadata-id',
    tabs: [verticalListTab],
  } as PageLayout;

  store.set(isLayoutCustomizationModeEnabledState.atom, true);
  store.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
    }),
    persistedPageLayout,
  );
  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
    }),
    makeDraft([verticalListTab]),
  );

  return store;
};

const renderRegistrationEffect = (store: ReturnType<typeof createStore>) =>
  render(
    <JotaiProvider store={store}>
      <PageLayoutComponentInstanceContext.Provider
        value={{ instanceId: PAGE_LAYOUT_ID }}
      >
        <PageLayoutRecordPageCustomizationSessionRegistrationEffect />
      </PageLayoutComponentInstanceContext.Provider>
    </JotaiProvider>,
  );

const getDraftWidgetIds = (store: ReturnType<typeof createStore>) =>
  store
    .get(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    )
    .tabs[0].widgets.map((widget) => widget.id);

const waitForPageLayoutRegistration = (store: ReturnType<typeof createStore>) =>
  waitFor(() => {
    expect(store.get(activeCustomizationPageLayoutIdsState.atom)).toEqual([
      PAGE_LAYOUT_ID,
    ]);
  });

describe('PageLayoutRecordPageCustomizationSessionRegistrationEffect', () => {
  beforeEach(() => {
    mockUseIsPageLayoutInEditMode.mockReturnValue(true);
  });

  it('normalizes the draft when the record page enters edit mode', async () => {
    const store = setupPageLayout();

    renderRegistrationEffect(store);

    await waitFor(() => {
      expect(getDraftWidgetIds(store)).toEqual(['fields', 'timeline']);
    });
    await waitForPageLayoutRegistration(store);
  });

  it('does not normalize a record page mounted outside edit mode', async () => {
    mockUseIsPageLayoutInEditMode.mockReturnValue(false);
    const store = setupPageLayout();

    renderRegistrationEffect(store);

    await waitForPageLayoutRegistration(store);
    expect(getDraftWidgetIds(store)).toEqual(['timeline', 'fields']);
  });
});
