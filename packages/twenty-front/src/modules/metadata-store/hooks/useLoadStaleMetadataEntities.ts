import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { splitObjectMetadataGqlResponse } from '@/metadata-store/utils/splitObjectMetadataGqlResponse';
import { splitPageLayoutWithRelated } from '@/metadata-store/utils/splitPageLayoutWithRelated';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FindAllViewsDocument,
  FindManyCommandMenuItemsDocument,
  FindAllRecordPageLayoutsDocument,
  FindFieldsWidgetViewsDocument,
  FindManyFrontComponentsDocument,
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
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();

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
              const { flatObjects, flatFields, flatIndexes } =
                splitObjectMetadataGqlResponse(result.data);

              replaceDraft('objectMetadataItems', flatObjects);
              replaceDraft('fieldMetadataItems', flatFields);
              replaceDraft('indexMetadataItems', flatIndexes);
            }),
        );
      }

      if (hasOverlap(staleEntityKeys, VIEWS_GROUP_KEYS)) {
        fetchPromises.push(
          Promise.all([
            client.query({
              query: FindAllViewsDocument,
              variables: { viewTypes: INDEX_VIEW_TYPES },
              fetchPolicy: 'network-only',
            }),
            client.query({
              query: FindFieldsWidgetViewsDocument,
              variables: { viewTypes: FIELDS_WIDGET_VIEW_TYPES },
              fetchPolicy: 'network-only',
            }),
          ]).then(([indexViewsResult, fieldsWidgetViewsResult]) => {
            const allViews = [
              ...(indexViewsResult.data?.getViews ?? []),
              ...(fieldsWidgetViewsResult.data?.getViews ?? []),
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

            replaceDraft('views', flatViews);
            replaceDraft('viewFields', flatViewFields);
            replaceDraft('viewFilters', flatViewFilters);
            replaceDraft('viewSorts', flatViewSorts);
            replaceDraft('viewGroups', flatViewGroups);
            replaceDraft('viewFilterGroups', flatViewFilterGroups);
            replaceDraft('viewFieldGroups', flatViewFieldGroups);
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

              replaceDraft('pageLayouts', flatPageLayouts);
              replaceDraft('pageLayoutTabs', flatPageLayoutTabs);
              replaceDraft('pageLayoutWidgets', flatPageLayoutWidgets);
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

              replaceDraft(
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

              replaceDraft(
                'navigationMenuItems',
                result.data.navigationMenuItems,
              );
            }),
        );
      }

      if (staleEntityKeys.includes('commandMenuItems')) {
        fetchPromises.push(
          client
            .query({
              query: FindManyCommandMenuItemsDocument,
              fetchPolicy: 'network-only',
            })
            .then((result) => {
              if (!isDefined(result.data?.commandMenuItems)) {
                return;
              }

              replaceDraft('commandMenuItems', result.data.commandMenuItems);
            }),
        );
      }

      if (staleEntityKeys.includes('frontComponents')) {
        fetchPromises.push(
          client
            .query({
              query: FindManyFrontComponentsDocument,
              fetchPolicy: 'network-only',
            })
            .then((result) => {
              if (!isDefined(result.data?.frontComponents)) {
                return;
              }

              replaceDraft('frontComponents', result.data.frontComponents);
            }),
        );
      }

      await Promise.all(fetchPromises);
      applyChanges();
    },
    [client, replaceDraft, applyChanges],
  );

  return { loadStaleMetadataEntities };
};
