import { FIELDS_WIDGET_VIEW_TYPES } from '@/metadata-store/constants/FieldsWidgetViewTypes';
import { INDEX_VIEW_TYPES } from '@/metadata-store/constants/IndexViewTypes';
import { VIEW_FAMILY_ENTITY_KEYS } from '@/metadata-store/constants/ViewFamilyEntityKeys';
import { WIDGET_VIEW_TYPES } from '@/metadata-store/constants/WidgetViewTypes';
import { useLoadViewFamily } from '@/metadata-store/hooks/useLoadViewFamily';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { splitObjectMetadataGqlResponse } from '@/metadata-store/utils/splitObjectMetadataGqlResponse';
import { splitPageLayoutWithRelated } from '@/metadata-store/utils/splitPageLayoutWithRelated';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { viewFamilyLoadEpochState } from '@/metadata-store/states/viewFamilyLoadEpochState';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FindAllViewsDocument,
  FindManyCommandMenuItemsDocument,
  FindAllRecordPageLayoutsDocument,
  FindAllRecordFormPageLayoutsDocument,
  FindFieldsWidgetViewsDocument,
  FindTableWidgetViewsDocument,
  FindManyFrontComponentsDocument,
  FindManyLogicFunctionsDocument,
  FindManyNavigationMenuItemsDocument,
  type ObjectMetadataItemsQuery,
} from '~/generated-metadata/graphql';

const OBJECTS_GROUP_KEYS: MetadataEntityKey[] = [
  'objectMetadataItems',
  'fieldMetadataItems',
  'indexMetadataItems',
];

const PAGE_LAYOUTS_GROUP_KEYS: MetadataEntityKey[] = [
  'pageLayouts',
  'pageLayoutTabs',
  'pageLayoutWidgets',
];

const hasOverlap = (
  staleKeys: MetadataEntityKey[],
  groupKeys: MetadataEntityKey[],
): boolean => staleKeys.some((key) => groupKeys.includes(key));

export const useLoadStaleMetadataEntities = () => {
  const client = useApolloClient();
  const store = useStore();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { loadViewFamily, isSplitModeActive } = useLoadViewFamily();

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

      if (
        hasOverlap(staleEntityKeys, VIEW_FAMILY_ENTITY_KEYS) &&
        isSplitModeActive()
      ) {
        fetchPromises.push(loadViewFamily());
      } else if (hasOverlap(staleEntityKeys, VIEW_FAMILY_ENTITY_KEYS)) {
        store.set(viewFamilyLoadEpochState.atom, (epoch) => epoch + 1);

        const legacyLoadEpoch = store.get(viewFamilyLoadEpochState.atom);

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
            client.query({
              query: FindTableWidgetViewsDocument,
              variables: { viewTypes: WIDGET_VIEW_TYPES },
              fetchPolicy: 'network-only',
            }),
          ]).then(
            ([
              indexViewsResult,
              fieldsWidgetViewsResult,
              tableWidgetViewsResult,
            ]) => {
              if (
                store.get(viewFamilyLoadEpochState.atom) !== legacyLoadEpoch
              ) {
                return;
              }

              const allViews = [
                ...(indexViewsResult.data?.getViews ?? []),
                ...(fieldsWidgetViewsResult.data?.getViews ?? []),
                ...(tableWidgetViewsResult.data?.getViews ?? []),
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
            },
          ),
        );
      }

      if (hasOverlap(staleEntityKeys, PAGE_LAYOUTS_GROUP_KEYS)) {
        fetchPromises.push(
          Promise.all([
            client.query({
              query: FindAllRecordPageLayoutsDocument,
              fetchPolicy: 'network-only',
            }),
            client.query({
              query: FindAllRecordFormPageLayoutsDocument,
              fetchPolicy: 'network-only',
            }),
          ]).then(([recordPageResult, recordFormResult]) => {
            const allPageLayouts = [
              ...(recordPageResult.data?.getPageLayouts ?? []),
              ...(recordFormResult.data?.getPageLayouts ?? []),
            ];

            const transformed = allPageLayouts.map(transformPageLayout);

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

      const settledFetches = await Promise.allSettled(fetchPromises);

      applyChanges();

      const firstRejectedFetch = settledFetches.find(
        (settledFetch) => settledFetch.status === 'rejected',
      );

      if (isDefined(firstRejectedFetch)) {
        throw firstRejectedFetch.reason;
      }
    },
    [
      client,
      store,
      replaceDraft,
      applyChanges,
      loadViewFamily,
      isSplitModeActive,
    ],
  );

  return { loadStaleMetadataEntities };
};
