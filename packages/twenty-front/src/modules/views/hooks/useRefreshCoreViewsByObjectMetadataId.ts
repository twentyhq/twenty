import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { coreViewsByObjectMetadataIdFamilySelector } from '@/views/states/coreViewsByObjectMetadataIdFamilySelector';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { getFilterableFieldsWithVectorSearch } from '@/views/utils/getFilterableFieldsWithVectorSearch';

import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useFindManyCoreViewsLazyQuery } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshCoreViewsByObjectMetadataId = () => {
  const [findManyCoreViewsLazy] = useFindManyCoreViewsLazyQuery();

  const refreshCoreViewsByObjectMetadataId = useRecoilCallback(
    ({ snapshot, set }) =>
      async (objectMetadataId: string) => {
        const result = await findManyCoreViewsLazy({
          variables: {
            objectMetadataId,
          },
          fetchPolicy: 'network-only',
        });

        if (!isDefined(result.data?.getCoreViews)) {
          return;
        }

        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        const objectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
        );

        if (!isDefined(objectMetadataItem)) {
          return;
        }

        const coreViewsForObjectMetadataId = snapshot
          .getLoadable(
            coreViewsByObjectMetadataIdFamilySelector(objectMetadataId),
          )
          .getValue();

        if (
          isDeeplyEqual(coreViewsForObjectMetadataId, result.data.getCoreViews)
        ) {
          return;
        }

        set(
          coreViewsByObjectMetadataIdFamilySelector(objectMetadataId),
          result.data.getCoreViews,
        );

        for (const coreView of result.data.getCoreViews) {
          const existingView = coreViewsForObjectMetadataId.find(
            (coreViewForObjectMetadata) =>
              coreViewForObjectMetadata.id === coreView.id,
          );

          if (!isDefined(existingView)) {
            continue;
          }

          if (!isDeeplyEqual(coreView.viewFields, existingView.viewFields)) {
            const view = convertCoreViewToView(coreView);
            set(
              currentRecordFieldsComponentState.atomFamily({
                instanceId: getRecordIndexIdFromObjectNamePluralAndViewId(
                  objectMetadataItem.namePlural,
                  view.id,
                ),
              }),
              view.viewFields
                .filter(isDefined)
                .map((viewField) => mapViewFieldToRecordField(viewField)),
            );
          }

          if (!isDeeplyEqual(coreView.viewFilters, existingView.viewFilters)) {
            const view = convertCoreViewToView(coreView);
            set(
              currentRecordFiltersComponentState.atomFamily({
                instanceId: getRecordIndexIdFromObjectNamePluralAndViewId(
                  objectMetadataItem.namePlural,
                  view.id,
                ),
              }),
              mapViewFiltersToFilters(
                view.viewFilters,
                getFilterableFieldsWithVectorSearch(objectMetadataItem),
              ),
            );
          }

          if (!isDeeplyEqual(coreView.viewSorts, existingView.viewSorts)) {
            const view = convertCoreViewToView(coreView);
            set(
              currentRecordSortsComponentState.atomFamily({
                instanceId: getRecordIndexIdFromObjectNamePluralAndViewId(
                  objectMetadataItem.namePlural,
                  view.id,
                ),
              }),
              mapViewSortsToSorts(view.viewSorts),
            );
          }
        }
      },
    [findManyCoreViewsLazy],
  );

  return {
    refreshCoreViewsByObjectMetadataId,
  };
};
