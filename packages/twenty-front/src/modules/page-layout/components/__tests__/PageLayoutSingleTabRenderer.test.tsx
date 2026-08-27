import { PageLayoutSingleTabRenderer } from '@/page-layout/components/PageLayoutSingleTabRenderer';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

const PAGE_LAYOUT_ID = 'page-layout-id';

jest.mock(
  '@/object-record/record-show/components/RecordIdentifierBarTitle',
  () => ({
    RecordIdentifierBarTitle: ({
      objectNameSingular,
      objectRecordId,
    }: {
      objectNameSingular: string;
      objectRecordId: string;
    }) => <div>{`${objectNameSingular}: ${objectRecordId}`}</div>,
  }),
);

jest.mock(
  '@/page-layout/components/PageLayoutInitializationQueryEffect',
  () => ({
    PageLayoutInitializationQueryEffect: () => null,
  }),
);

jest.mock(
  '@/page-layout/components/PageLayoutRecordPageCustomizationSessionRegistrationEffect',
  () => ({
    PageLayoutRecordPageCustomizationSessionRegistrationEffect: () => null,
  }),
);

jest.mock(
  '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftsInitializationEffect',
  () => ({
    RecordTableWidgetViewDraftsInitializationEffect: () => null,
  }),
);

jest.mock('@/page-layout/components/dnd/PageLayoutWidgetDndProvider', () => ({
  PageLayoutWidgetDndProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/page-layout/components/PageLayoutContent', () => ({
  PageLayoutContent: () => {
    const { tabId } = usePageLayoutContentContext();

    return <div>Rendered tab: {tabId}</div>;
  },
}));

describe('PageLayoutSingleTabRenderer', () => {
  it('updates the identifier title when switching from a source record to the merge preview', () => {
    const store = createStore();

    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      {
        id: PAGE_LAYOUT_ID,
        name: 'Record Page',
        type: PageLayoutType.RECORD_PAGE,
        tabs: [makeTab('fields-tab', [])],
      } as PageLayout,
    );
    store.set(
      pageLayoutIsInitializedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      true,
    );

    const renderForRecord = (recordId: string) => (
      <JotaiProvider store={store}>
        <LayoutRenderingProvider
          value={{
            targetRecordIdentifier: {
              id: recordId,
              targetObjectNameSingular: 'company',
            },
            layoutType: PageLayoutType.RECORD_PAGE,
            isInSidePanel: true,
          }}
        >
          <PageLayoutSingleTabRenderer pageLayoutId={PAGE_LAYOUT_ID} />
        </LayoutRenderingProvider>
      </JotaiProvider>
    );

    const { rerender } = render(renderForRecord('source-record'));

    expect(screen.getByText('company: source-record')).toBeVisible();
    expect(screen.getByText('Rendered tab: fields-tab')).toBeVisible();

    rerender(renderForRecord('merge-preview'));

    expect(
      screen.queryByText('company: source-record'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('company: merge-preview')).toBeVisible();
    expect(screen.getByText('Rendered tab: fields-tab')).toBeVisible();
  });
});
