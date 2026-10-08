import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { UPDATE_PAGE_LAYOUT_WIDGET_IS_ACTIVE } from '@/page-layout/graphql/mutations/updatePageLayoutWidgetIsActive';
import { useUpdatePageLayoutWidgetsIsActive } from '@/page-layout/hooks/useUpdatePageLayoutWidgetsIsActive';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const handleMetadataError = jest.fn();

jest.mock('@/metadata-error-handler/hooks/useMetadataErrorHandler', () => ({
  useMetadataErrorHandler: () => ({ handleMetadataError }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

const updatePageLayoutWidgetIsActiveResult = jest.fn(
  (variables: { id: string; isActive: boolean }) => ({
    data: {
      updatePageLayoutWidget: {
        __typename: 'PageLayoutWidget',
        id: variables.id,
        isActive: variables.isActive,
      },
    },
  }),
);

const buildWidget = (id: string, isActive: boolean) => ({
  id,
  pageLayoutTabId: 'tab-id',
  title: '',
  isActive,
});

const getStoredWidgets = (store: ReturnType<typeof createStore>) =>
  store.get(metadataStoreState.atomFamily('pageLayoutWidgets')).current;

const renderUpdateHook = (
  store: ReturnType<typeof createStore>,
  mocks: MockedResponse[],
) =>
  renderHook(() => useUpdatePageLayoutWidgetsIsActive(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      </JotaiProvider>
    ),
  });

describe('useUpdatePageLayoutWidgetsIsActive', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore();
    store.set(metadataStoreState.atomFamily('pageLayoutWidgets'), {
      current: [
        buildWidget('widget-a', true),
        buildWidget('widget-b', false),
        buildWidget('widget-c', false),
      ],
      draft: [],
      status: 'up-to-date',
    });
  });

  it('persists each visibility change and reflects it in the metadata store', async () => {
    const { result } = renderUpdateHook(store, [
      {
        request: {
          query: UPDATE_PAGE_LAYOUT_WIDGET_IS_ACTIVE,
          variables: () => true,
        },
        maxUsageCount: Number.POSITIVE_INFINITY,
        result: updatePageLayoutWidgetIsActiveResult,
      },
    ]);

    let outcome: { status: string } | undefined;

    await act(async () => {
      outcome = await result.current.updatePageLayoutWidgetsIsActive([
        { widgetId: 'widget-a', isActive: false },
        { widgetId: 'widget-b', isActive: true },
      ]);
    });

    expect(outcome).toEqual({ status: 'successful' });
    expect(
      updatePageLayoutWidgetIsActiveResult.mock.calls.map(
        ([variables]) => variables,
      ),
    ).toEqual([
      { id: 'widget-a', isActive: false },
      { id: 'widget-b', isActive: true },
    ]);
    expect(getStoredWidgets(store)).toEqual([
      buildWidget('widget-a', false),
      buildWidget('widget-b', true),
      buildWidget('widget-c', false),
    ]);
  });

  it('keeps the changes saved before a refusal and stops there', async () => {
    const { result } = renderUpdateHook(store, [
      {
        request: {
          query: UPDATE_PAGE_LAYOUT_WIDGET_IS_ACTIVE,
          variables: { id: 'widget-a', isActive: false },
        },
        result: updatePageLayoutWidgetIsActiveResult,
      },
      {
        request: {
          query: UPDATE_PAGE_LAYOUT_WIDGET_IS_ACTIVE,
          variables: { id: 'widget-b', isActive: true },
        },
        result: { errors: [new GraphQLError('Forbidden')] },
      },
      {
        request: {
          query: UPDATE_PAGE_LAYOUT_WIDGET_IS_ACTIVE,
          variables: { id: 'widget-c', isActive: true },
        },
        result: updatePageLayoutWidgetIsActiveResult,
      },
    ]);

    let outcome: { status: string } | undefined;

    await act(async () => {
      outcome = await result.current.updatePageLayoutWidgetsIsActive([
        { widgetId: 'widget-a', isActive: false },
        { widgetId: 'widget-b', isActive: true },
        { widgetId: 'widget-c', isActive: true },
      ]);
    });

    expect(outcome).toEqual({ status: 'failed' });
    expect(handleMetadataError).toHaveBeenCalledTimes(1);
    expect(
      updatePageLayoutWidgetIsActiveResult.mock.calls.map(
        ([variables]) => variables,
      ),
    ).toEqual([{ id: 'widget-a', isActive: false }]);
    expect(getStoredWidgets(store)).toEqual([
      buildWidget('widget-a', false),
      buildWidget('widget-b', false),
      buildWidget('widget-c', false),
    ]);
  });
});
