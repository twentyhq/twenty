import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { splitObjectMetadataItemWithRelated } from '@/metadata-store/utils/splitObjectMetadataItemWithRelated';
import { splitPageLayoutWithRelated } from '@/metadata-store/utils/splitPageLayoutWithRelated';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { logicFunctionsState } from '@/settings/logic-functions/states/logicFunctionsState';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FindAllCoreViewsDocument,
  FindAllRecordPageLayoutsDocument,
  FindFieldsWidgetCoreViewsDocument,
  FindManyLogicFunctionsDocument,
  FindManyNavigationMenuItemsDocument,
  type ObjectMetadataItemsQuery,
  ViewType,
} from '~/generated-metadata/graphql';

const OBJECTS_GROUP_KEYS: MetadataEntityKey[] = [
  'objectMetadataItems',
  'fieldMetadataItems',
  'indexMetadataItems',
];

const VIEWS_GROUP_KEYS: MetadataEntityKey[] = [
  'views',
  'viewFields',
  'viewFilters',
  'viewSorts',
  'viewGroups',
  'viewFilterGroups',
  'viewFieldGroups',
];

const PAGE_LAYOUTS_GROUP_KEYS: MetadataEntityKey[] = [
  'pageLayouts',
  'pageLayoutTabs',
  'pageLayoutWidgets',
];

const INDEX_VIEW_TYPES = [ViewType.TABLE, ViewType.KANBAN, ViewType.CALENDAR];
const FIELDS_WIDGET_VIEW_TYPES = [ViewType.FIELDS_WIDGET];

const hasOverlap = (
  staleKeys: MetadataEntityKey[],
  groupKeys: MetadataEntityKey[],
): boolean => staleKeys.some((key) => groupKeys.includes(key));

export const useLoadStaleMetadataEntities = () => {
  const client = useApolloClient();
  const store = useStore();
  const { updateDraft, applyChanges } = useMetadataStore();

  const loadStaleMetadataEntities = useCallback(
    async (staleEntityKeys: MetadataEntityKey[]) => {
      if (staleEntityKeys.length === 0) {
        return;
      }

      const fetchPromises: Promise<void>[] = [];

      if (hasOverlap(staleEntityKeys, OBJECTS_GROUP_KEYS)) {
        fetchPromises.push(
          client
            .query<ObjectMetadataItemsQuery>({
              query: FIND_MANY_OBJECT_METADATA_ITEMS,
              fetchPolicy: 'network-only',
            })
            .then((result) => {
              const compositeObjects =
                mapPaginatedObjectMetadataItemsToObjectMetadataItems({
                  pagedObjectMetadataItems: result.data,
                });

              const { flatObjects, flatFields, flatIndexes } =
                splitObjectMetadataItemWithRelated(compositeObjects);

              updateDraft('objectMetadataItems', flatObjects);
              updateDraft('fieldMetadataItems', flatFields);
              updateDraft('indexMetadataItems', flatIndexes);
            }),
        );
      }

      if (hasOverlap(staleEntityKeys, VIEWS_GROUP_KEYS)) {
        fetchPromises.push(
          Promise.all([
            client.query({
              query: FindAllCoreViewsDocument,
              variables: { viewTypes: INDEX_VIEW_TYPES },
              fetchPolicy: 'network-only',
            }),
            client.query({
              query: FindFieldsWidgetCoreViewsDocument,
              variables: { viewTypes: FIELDS_WIDGET_VIEW_TYPES },
              fetchPolicy: 'network-only',
            }),
          ]).then(([indexViewsResult, fieldsWidgetViewsResult]) => {
            const allViews = [
              ...(indexViewsResult.data?.getCoreViews ?? []),
              ...(fieldsWidgetViewsResult.data?.getCoreViews ?? []),
            ];

            const {
              flatViews,
              flatViewFields,
              flatViewFilters,
              flatViewSorts,
              flatViewGroups,
              flatViewFilterGroups,
              flatViewFieldGroups,
            } = splitViewWithRelated(allViews);

            updateDraft('views', flatViews);
            updateDraft('viewFields', flatViewFields);
            updateDraft('viewFilters', flatViewFilters);
            updateDraft('viewSorts', flatViewSorts);
            updateDraft('viewGroups', flatViewGroups);
            updateDraft('viewFilterGroups', flatViewFilterGroups);
            updateDraft('viewFieldGroups', flatViewFieldGroups);
          }),
        );
      }

      if (hasOverlap(staleEntityKeys, PAGE_LAYOUTS_GROUP_KEYS)) {
        fetchPromises.push(
          client
            .query({
              query: FindAllRecordPageLayoutsDocument,
              fetchPolicy: 'network-only',
            })
            .then((result) => {
              if (!isDefined(result.data?.getPageLayouts)) {
                return;
              }

              const transformed =
                result.data.getPageLayouts.map(transformPageLayout);

              const {
                flatPageLayouts,
                flatPageLayoutTabs,
                flatPageLayoutWidgets,
              } = splitPageLayoutWithRelated(transformed);

              updateDraft('pageLayouts', flatPageLayouts);
              updateDraft('pageLayoutTabs', flatPageLayoutTabs);
              updateDraft('pageLayoutWidgets', flatPageLayoutWidgets);
            }),
        );
      }

      if (staleEntityKeys.includes('logicFunctions')) {
        fetchPromises.push(
          client
            .query({
              query: FindManyLogicFunctionsDocument,
              fetchPolicy: 'network-only',
            })
            .then((result) => {
              if (!isDefined(result.data?.findManyLogicFunctions)) {
                return;
              }

              store.set(
                logicFunctionsState.atom,
                result.data.findManyLogicFunctions,
              );
              updateDraft(
                'logicFunctions',
                result.data.findManyLogicFunctions,
              );
            }),
        );
      }

      if (staleEntityKeys.includes('navigationMenuItems')) {
        fetchPromises.push(
          client
            .query({
              query: FindManyNavigationMenuItemsDocument,
              fetchPolicy: 'network-only',
            })
            .then((result) => {
              if (!isDefined(result.data?.navigationMenuItems)) {
                return;
              }

              store.set(
                navigationMenuItemsState.atom,
                result.data.navigationMenuItems,
              );
              updateDraft(
                'navigationMenuItems',
                result.data.navigationMenuItems,
              );
            }),
        );
      }

      await Promise.all(fetchPromises);
      applyChanges();
    },
    [client, store, updateDraft, applyChanges],
  );

  return { loadStaleMetadataEntities };
};
