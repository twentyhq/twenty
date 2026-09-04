import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { PageLayoutSingleTabRenderer } from '@/page-layout/components/PageLayoutSingleTabRenderer';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

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
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-27T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('updates the identifier title and creation date when switching between merge records', () => {
    const store = createStore();

    store.set(recordStoreFamilyState.atomFamily('source-record'), {
      __typename: 'Company',
      id: 'source-record',
      createdAt: '2026-08-25T12:00:00.000Z',
    });
    store.set(recordStoreFamilyState.atomFamily('merge-preview'), {
      __typename: 'Company',
      id: 'merge-preview',
      createdAt: '2026-08-26T12:00:00.000Z',
    });

    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
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
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
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
          }}
        >
          <I18nProvider i18n={i18n}>
            <PageLayoutSingleTabRenderer pageLayoutId={PAGE_LAYOUT_ID} />
          </I18nProvider>
        </LayoutRenderingProvider>
      </JotaiProvider>
    );

    const { rerender } = render(renderForRecord('source-record'));

    expect(screen.getByText('company: source-record')).toBeVisible();
    expect(screen.getByText('Created 2 days ago')).toBeVisible();
    expect(screen.getByText('Rendered tab: fields-tab')).toBeVisible();

    rerender(renderForRecord('merge-preview'));

    expect(
      screen.queryByText('company: source-record'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('company: merge-preview')).toBeVisible();
    expect(screen.getByText('Created 1 day ago')).toBeVisible();
    expect(screen.queryByText('Created 2 days ago')).not.toBeInTheDocument();
    expect(screen.getByText('Rendered tab: fields-tab')).toBeVisible();

    rerender(renderForRecord('preview-without-created-at'));

    expect(
      screen.getByText('company: preview-without-created-at'),
    ).toBeVisible();
    expect(screen.queryByText(/^Created /)).not.toBeInTheDocument();
    expect(screen.getByText('Rendered tab: fields-tab')).toBeVisible();
  });
});
