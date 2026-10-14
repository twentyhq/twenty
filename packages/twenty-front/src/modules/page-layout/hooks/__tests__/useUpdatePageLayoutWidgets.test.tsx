import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { UPDATE_PAGE_LAYOUT_WIDGET } from '@/page-layout/graphql/mutations/updatePageLayoutWidget';
import { useUpdatePageLayoutWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWidgets';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const handleMetadataError = jest.fn();

jest.mock('@/metadata-error-handler/hooks/useMetadataErrorHandler', () => ({
  useMetadataErrorHandler: () => ({ handleMetadataError }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

const updatePageLayoutWidgetResult = jest.fn(
  (variables: {
    id: string;
    input: {
      isActive?: boolean;
      position?: { layoutMode: PageLayoutTabLayoutMode; index: number };
    };
  }) => ({
    data: {
      updatePageLayoutWidget: {
        __typename: 'PageLayoutWidget',
        id: variables.id,
        isActive: variables.input.isActive ?? false,
        position: variables.input.position
          ? {
              __typename: 'PageLayoutWidgetVerticalListPosition',
              heightBehavior: null,
              ...variables.input.position,
            }
          : null,
      },
    },
  }),
);

const buildWidget = (id: string, isActive: boolean) => ({
  id,
  pageLayoutTabId: 'tab-id',
  title: '',
  isActive,
  position: null,
});

const getStoredWidgets = (store: ReturnType<typeof createStore>) =>
  store.get(metadataStoreState.atomFamily('pageLayoutWidgets')).current;

const renderUpdateHook = (
  store: ReturnType<typeof createStore>,
  mocks: MockedResponse[],
) =>
  renderHook(() => useUpdatePageLayoutWidgets(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>
        <MockedProvider mocks={mocks}>{children}</MockedProvider>
      </JotaiProvider>
    ),
  });

describe('useUpdatePageLayoutWidgets', () => {
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
          query: UPDATE_PAGE_LAYOUT_WIDGET,
          variables: () => true,
        },
        maxUsageCount: Number.POSITIVE_INFINITY,
        result: updatePageLayoutWidgetResult,
      },
    ]);

    let outcome: { status: string } | undefined;

    await act(async () => {
      outcome = await result.current.updatePageLayoutWidgets([
        { widgetId: 'widget-a', isActive: false },
        { widgetId: 'widget-b', isActive: true },
      ]);
    });

    expect(outcome).toEqual({ status: 'successful' });
    expect(
      updatePageLayoutWidgetResult.mock.calls.map(([variables]) => variables),
    ).toEqual([
      { id: 'widget-a', input: { isActive: false } },
      { id: 'widget-b', input: { isActive: true } },
    ]);
    expect(getStoredWidgets(store)).toEqual([
      buildWidget('widget-a', false),
      buildWidget('widget-b', true),
      buildWidget('widget-c', false),
    ]);
  });

  it('sends the visibility and position changes of a widget in one call', async () => {
    const { result } = renderUpdateHook(store, [
      {
        request: {
          query: UPDATE_PAGE_LAYOUT_WIDGET,
          variables: () => true,
        },
        maxUsageCount: Number.POSITIVE_INFINITY,
        result: updatePageLayoutWidgetResult,
      },
    ]);

    await act(async () => {
      await result.current.updatePageLayoutWidgets([
        { widgetId: 'widget-b', isActive: true },
        {
          widgetId: 'widget-b',
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
        },
      ]);
    });

    expect(
      updatePageLayoutWidgetResult.mock.calls.map(([variables]) => variables),
    ).toEqual([
      {
        id: 'widget-b',
        input: {
          isActive: true,
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
        },
      },
    ]);
  });

  it('persists a position change and reflects it in the metadata store', async () => {
    const { result } = renderUpdateHook(store, [
      {
        request: {
          query: UPDATE_PAGE_LAYOUT_WIDGET,
          variables: () => true,
        },
        result: updatePageLayoutWidgetResult,
      },
    ]);

    await act(async () => {
      await result.current.updatePageLayoutWidgets([
        {
          widgetId: 'widget-c',
          isActive: false,
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
        },
      ]);
    });

    expect(
      updatePageLayoutWidgetResult.mock.calls.map(([variables]) => variables),
    ).toEqual([
      {
        id: 'widget-c',
        input: {
          isActive: false,
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
        },
      },
    ]);
    expect(getStoredWidgets(store)).toEqual([
      buildWidget('widget-a', true),
      buildWidget('widget-b', false),
      {
        ...buildWidget('widget-c', false),
        position: {
          __typename: 'PageLayoutWidgetVerticalListPosition',
          heightBehavior: null,
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
        },
      },
    ]);
  });

  it('keeps the changes saved before a refusal and stops there', async () => {
    const { result } = renderUpdateHook(store, [
      {
        request: {
          query: UPDATE_PAGE_LAYOUT_WIDGET,
          variables: { id: 'widget-a', input: { isActive: false } },
        },
        result: updatePageLayoutWidgetResult,
      },
      {
        request: {
          query: UPDATE_PAGE_LAYOUT_WIDGET,
          variables: { id: 'widget-b', input: { isActive: true } },
        },
        result: { errors: [new GraphQLError('Forbidden')] },
      },
      {
        request: {
          query: UPDATE_PAGE_LAYOUT_WIDGET,
          variables: { id: 'widget-c', input: { isActive: true } },
        },
        result: updatePageLayoutWidgetResult,
      },
    ]);

    let outcome: { status: string } | undefined;

    await act(async () => {
      outcome = await result.current.updatePageLayoutWidgets([
        { widgetId: 'widget-a', isActive: false },
        { widgetId: 'widget-b', isActive: true },
        { widgetId: 'widget-c', isActive: true },
      ]);
    });

    expect(outcome).toEqual({ status: 'failed' });
    expect(handleMetadataError).toHaveBeenCalledTimes(1);
    expect(
      updatePageLayoutWidgetResult.mock.calls.map(([variables]) => variables),
    ).toEqual([{ id: 'widget-a', input: { isActive: false } }]);
    expect(getStoredWidgets(store)).toEqual([
      buildWidget('widget-a', false),
      buildWidget('widget-b', false),
      buildWidget('widget-c', false),
    ]);
  });
});
