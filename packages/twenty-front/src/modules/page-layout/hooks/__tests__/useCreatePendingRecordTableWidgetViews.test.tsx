import { useCreatePendingRecordTableWidgetViews } from '@/page-layout/hooks/useCreatePendingRecordTableWidgetViews';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';
import { ToastProvider } from 'twenty-ui/primitives/feedback';
import {
  CreateViewDocument,
  WidgetConfigurationType,
  WidgetType,
  type CreateViewMutationVariables,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PAGE_LAYOUT_ID = 'page-layout-id';
const WIDGET_ID = 'widget-id';

const snapshot = buildRecordTableWidgetViewSnapshot(
  getMockObjectMetadataItemOrThrow('company'),
);

const recordTableWidget = {
  ...makeWidget(WIDGET_ID, 0),
  type: WidgetType.RECORD_TABLE,
  configuration: {
    __typename: 'RecordTableConfiguration' as const,
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    viewId: snapshot.view.id,
  },
} as unknown as PageLayoutWidget;

const createViewResult = jest.fn((variables: CreateViewMutationVariables) => ({
  data: {
    createView: {
      __typename: 'View',
      id: variables.input.id,
      viewGroups: [],
    },
  },
}));

const mocks: MockedResponse[] = [
  {
    request: {
      query: CreateViewDocument,
      variables: () => true,
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: createViewResult,
  },
];

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={mocks}
        defaultOptions={{ mutate: { fetchPolicy: 'no-cache' } }}
      >
        <ToastProvider>{children}</ToastProvider>
      </MockedProvider>
    </JotaiProvider>
  );

const createPendingViewsWithGroupLoadLimit = async (groupLoadLimit: number) => {
  const store = createStore();

  store.set(
    pageLayoutDraftComponentState.atomFamily({ instanceId: PAGE_LAYOUT_ID }),
    makeDraft([makeTab('tab-1', [recordTableWidget])]),
  );
  store.set(
    recordTableWidgetViewDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
    }),
    {
      [WIDGET_ID]: {
        ...snapshot,
        view: { ...snapshot.view, groupLoadLimit },
      },
    },
  );

  const { result } = renderHook(
    () => useCreatePendingRecordTableWidgetViews(),
    { wrapper: getWrapper(store) },
  );

  await act(async () => {
    await result.current.createPendingRecordTableWidgetViews(PAGE_LAYOUT_ID);
  });

  return createViewResult.mock.calls[0][0].input;
};

describe('useCreatePendingRecordTableWidgetViews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create the backing view with the widget group load limit', async () => {
    const input = await createPendingViewsWithGroupLoadLimit(50);

    expect(createViewResult).toHaveBeenCalledTimes(1);
    expect(input.groupLoadLimit).toBe(50);
  });

  it('should create the backing view with the default group load limit when unchanged', async () => {
    const input = await createPendingViewsWithGroupLoadLimit(
      DEFAULT_VIEW_GROUP_LOAD_LIMIT,
    );

    expect(input.groupLoadLimit).toBe(DEFAULT_VIEW_GROUP_LOAD_LIMIT);
  });
});
