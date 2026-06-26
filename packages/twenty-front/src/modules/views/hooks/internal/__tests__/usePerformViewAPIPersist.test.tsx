import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { act, renderHook } from '@testing-library/react';
import {
  CreateViewDocument,
  DestroyViewDocument,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const NEW_VIEW_ID = '20202020-0000-0000-0000-000000000002';
const EXISTING_VIEW_ID = '20202020-0000-0000-0000-000000000003';

const objectMetadataItemsMock = getTestEnrichedObjectMetadataItemsMock();
const OBJECT_METADATA_ID =
  objectMetadataItemsMock.find((item) => item.nameSingular === 'company')?.id ??
  objectMetadataItemsMock[0].id;

const createViewInput = {
  id: NEW_VIEW_ID,
  name: 'My Kanban',
  icon: 'IconLayoutKanban',
  key: null,
  type: ViewType.KANBAN,
  objectMetadataId: OBJECT_METADATA_ID,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  visibility: ViewVisibility.WORKSPACE,
};

const createdViewResponse = {
  __typename: 'View',
  id: NEW_VIEW_ID,
  name: 'My Kanban',
  objectMetadataId: OBJECT_METADATA_ID,
  type: ViewType.KANBAN,
  key: null,
  icon: 'IconLayoutKanban',
  position: 3,
  isCompact: false,
  openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
  kanbanAggregateOperation: null,
  kanbanAggregateOperationFieldMetadataId: null,
  mainGroupByFieldMetadataId: null,
  shouldHideEmptyGroups: false,
  kanbanColumnWidth: null,
  anyFieldFilterValue: null,
  calendarFieldMetadataId: null,
  calendarLayout: null,
  visibility: ViewVisibility.WORKSPACE,
  createdByUserWorkspaceId: null,
  isActive: true,
  viewFields: [],
  viewFieldGroups: [],
  viewFilters: [],
  viewFilterGroups: [],
  viewSorts: [],
  viewGroups: [],
};

const existingView = {
  ...createdViewResponse,
  id: EXISTING_VIEW_ID,
  name: 'Existing Kanban',
  position: 0,
} as unknown as FlatView;

const seedViews = (views: FlatView[]) => {
  jotaiStore.set(metadataStoreState.atomFamily('views'), {
    current: views,
    draft: [],
    status: 'up-to-date',
  });
};

const getStoredViews = () =>
  jotaiStore.get(metadataStoreState.atomFamily('views')).current as FlatView[];

describe('usePerformViewAPIPersist', () => {
  it('should add the created view to the metadata store so the sidebar updates without a refresh', async () => {
    const Wrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [
        {
          request: {
            query: CreateViewDocument,
            variables: { input: createViewInput },
          },
          result: { data: { createView: createdViewResponse } },
        },
      ],
      onInitializeJotaiStore: () => seedViews([]),
    });

    const { result } = renderHook(() => usePerformViewAPIPersist(), {
      wrapper: Wrapper,
    });

    let apiResult: { status: string } | undefined;
    await act(async () => {
      apiResult = await result.current.performViewAPICreate(
        { input: createViewInput },
        OBJECT_METADATA_ID,
      );
    });

    expect(apiResult?.status).toBe('successful');

    const storedViews = getStoredViews();
    expect(storedViews).toHaveLength(1);
    expect(storedViews[0]).toEqual(
      expect.objectContaining({
        id: NEW_VIEW_ID,
        objectMetadataId: OBJECT_METADATA_ID,
        isActive: true,
      }),
    );
  });

  it('should remove the destroyed view from the metadata store so it disappears from the sidebar without a refresh', async () => {
    const Wrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [
        {
          request: {
            query: DestroyViewDocument,
            variables: { id: EXISTING_VIEW_ID },
          },
          result: { data: { destroyView: true } },
        },
      ],
      onInitializeJotaiStore: () => seedViews([existingView]),
    });

    const { result } = renderHook(() => usePerformViewAPIPersist(), {
      wrapper: Wrapper,
    });

    let apiResult: { status: string } | undefined;
    await act(async () => {
      apiResult = await result.current.performViewAPIDestroy({
        id: EXISTING_VIEW_ID,
      });
    });

    expect(apiResult?.status).toBe('successful');

    const storedViews = getStoredViews();
    expect(storedViews.some((view) => view.id === EXISTING_VIEW_ID)).toBe(
      false,
    );
  });
});
