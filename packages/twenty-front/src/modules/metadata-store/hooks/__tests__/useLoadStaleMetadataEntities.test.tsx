import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import {
  metadataStoreState,
  type MetadataEntityKey,
  type MetadataStoreItem,
} from '@/metadata-store/states/metadataStoreState';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import {
  FindAllViewsDocument,
  FindFieldsWidgetViewsDocument,
  FindManyNavigationMenuItemsDocument,
  FindTableWidgetViewsDocument,
  ViewKey,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';
import { mockedNavigationMenuItems } from '~/testing/mock-data/generated/metadata/navigation-menu-items/mock-navigation-menu-items-data';
import { mockedStandardObjectMetadataQueryResult } from '~/testing/mock-data/generated/metadata/objects/mock-objects-metadata';

const STALE_ENTITY_KEYS: MetadataEntityKey[] = [
  'objectMetadataItems',
  'fieldMetadataItems',
  'views',
  'viewFields',
  'navigationMenuItems',
];

const NAVIGATION_MENU_ITEMS_ERROR_MESSAGE = 'Cannot load navigation menu items';

const PREVIOUS_NAVIGATION_MENU_ITEMS_ENTRY: MetadataStoreItem = {
  current: mockedNavigationMenuItems.slice(0, 1),
  draft: [],
  status: 'up-to-date',
  draftCollectionHash: 'server-navigation-menu-items-hash',
};

const [{ node: MOCKED_OBJECT_METADATA_ITEM }] =
  mockedStandardObjectMetadataQueryResult.objects.edges;

const VIEW_ID = 'view-id';

const INDEX_VIEW = {
  __typename: 'View',
  id: VIEW_ID,
  name: 'All',
  objectMetadataId: MOCKED_OBJECT_METADATA_ITEM.id,
  type: ViewType.TABLE,
  key: ViewKey.INDEX,
  icon: 'IconList',
  position: 0,
  isCompact: false,
  kanbanAggregateOperation: null,
  kanbanAggregateOperationFieldMetadataId: null,
  mainGroupByFieldMetadataId: null,
  shouldHideEmptyGroups: false,
  kanbanColumnWidth: null,
  groupLoadLimit: null,
  anyFieldFilterValue: null,
  calendarFieldMetadataId: null,
  calendarEndFieldMetadataId: null,
  calendarLayout: null,
  visibility: ViewVisibility.WORKSPACE,
  createdByUserWorkspaceId: null,
  applicationId: MOCKED_OBJECT_METADATA_ITEM.applicationId,
  isActive: true,
  viewFields: [
    {
      __typename: 'ViewField',
      id: 'view-field-id',
      fieldMetadataId: MOCKED_OBJECT_METADATA_ITEM.fieldsList[0].id,
      viewId: VIEW_ID,
      isVisible: true,
      position: 0,
      size: 150,
      aggregateOperation: null,
      viewFieldGroupId: null,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
    },
  ],
  viewFieldGroups: [],
  viewFilters: [],
  viewFilterGroups: [],
  viewSorts: [],
  viewGroups: [],
};

const objectsMock: MockedResponse = {
  request: { query: FIND_MANY_OBJECT_METADATA_ITEMS },
  result: { data: mockedStandardObjectMetadataQueryResult },
};

const viewsMocks: MockedResponse[] = [
  {
    request: {
      query: FindAllViewsDocument,
      variables: {
        viewTypes: [
          ViewType.TABLE,
          ViewType.KANBAN,
          ViewType.CALENDAR,
          ViewType.LIST,
        ],
      },
    },
    result: { data: { getViews: [INDEX_VIEW] } },
  },
  {
    request: {
      query: FindFieldsWidgetViewsDocument,
      variables: { viewTypes: [ViewType.FIELDS_WIDGET] },
    },
    result: { data: { getViews: [] } },
  },
  {
    request: {
      query: FindTableWidgetViewsDocument,
      variables: {
        viewTypes: [
          ViewType.TABLE_WIDGET,
          ViewType.KANBAN_WIDGET,
          ViewType.LIST_WIDGET,
          ViewType.CALENDAR_WIDGET,
        ],
      },
    },
    result: { data: { getViews: [] } },
  },
];

const failingNavigationMenuItemsMock: MockedResponse = {
  request: { query: FindManyNavigationMenuItemsDocument },
  result: {
    errors: [new GraphQLError(NAVIGATION_MENU_ITEMS_ERROR_MESSAGE)],
  },
};

const renderLoadStaleMetadataEntities = () => {
  const store = createStore();

  store.set(
    metadataStoreState.atomFamily('navigationMenuItems'),
    PREVIOUS_NAVIGATION_MENU_ITEMS_ENTRY,
  );

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={[...viewsMocks, objectsMock, failingNavigationMenuItemsMock]}
      >
        {children}
      </MockedProvider>
    </JotaiProvider>
  );

  const { result } = renderHook(() => useLoadStaleMetadataEntities(), {
    wrapper,
  });

  return { result, store };
};

describe('useLoadStaleMetadataEntities', () => {
  it('applies the collections that loaded when another collection fails', async () => {
    const { result, store } = renderLoadStaleMetadataEntities();

    await act(async () => {
      await expect(
        result.current.loadStaleMetadataEntities(STALE_ENTITY_KEYS),
      ).rejects.toThrow(NAVIGATION_MENU_ITEMS_ERROR_MESSAGE);
    });

    const objectsEntry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );
    const fieldsEntry = store.get(
      metadataStoreState.atomFamily('fieldMetadataItems'),
    );
    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));
    const viewFieldsEntry = store.get(
      metadataStoreState.atomFamily('viewFields'),
    );

    expect(objectsEntry.status).toBe('up-to-date');
    expect(objectsEntry.current).toHaveLength(
      mockedStandardObjectMetadataQueryResult.objects.edges.length,
    );
    expect(fieldsEntry.status).toBe('up-to-date');
    expect(fieldsEntry.current).toContainEqual(
      expect.objectContaining({
        id: MOCKED_OBJECT_METADATA_ITEM.fieldsList[0].id,
      }),
    );
    expect(viewsEntry.status).toBe('up-to-date');
    expect(viewsEntry.current).toEqual([
      expect.objectContaining({ id: VIEW_ID }),
    ]);
    expect(viewFieldsEntry.status).toBe('up-to-date');
    expect(viewFieldsEntry.current).toEqual([
      expect.objectContaining({ id: 'view-field-id' }),
    ]);
  });

  it('keeps the previous data of the failed collection so it is refetched on the next load', async () => {
    const { result, store } = renderLoadStaleMetadataEntities();

    await act(async () => {
      await result.current
        .loadStaleMetadataEntities(STALE_ENTITY_KEYS)
        .catch(() => undefined);
    });

    expect(
      store.get(metadataStoreState.atomFamily('navigationMenuItems')),
    ).toEqual(PREVIOUS_NAVIGATION_MENU_ITEMS_ENTRY);
  });
});
