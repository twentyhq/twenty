import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { coreViewsByObjectMetadataIdFamilySelector } from '@/views/states/selectors/coreViewsByObjectMetadataIdFamilySelector';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { getFilterableFields } from '@/views/utils/getFilterableFields';

import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useRecoilCallback } from 'recoil';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';
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

        const coreViewsFromResult = result.data.getCoreViews;

        if (isDeeplyEqual(coreViewsForObjectMetadataId, coreViewsFromResult)) {
          return;
        }

        set(
          coreViewsByObjectMetadataIdFamilySelector(objectMetadataId),
          coreViewsFromResult,
        );

        for (const coreView of coreViewsFromResult) {
          const existingView = coreViewsForObjectMetadataId.find(
            (coreViewForObjectMetadata) =>
              coreViewForObjectMetadata.id === coreView.id,
          );

          if (!isDefined(existingView)) {
            continue;
          }

          if (
            !isDeeplyEqual(
              coreView.viewFields.map((viewField) =>
                removePropertiesFromRecord(viewField, [
                  'updatedAt',
                  'createdAt',
                ]),
              ),
              existingView.viewFields,
            )
          ) {
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

          if (
            !isDeeplyEqual(
              coreView.viewFilters.map((viewFilter) =>
                removePropertiesFromRecord(viewFilter, [
                  'createdAt',
                  'updatedAt',
                ]),
              ),
              existingView.viewFilters,
            )
          ) {
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
                getFilterableFields(objectMetadataItem),
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
              view.viewSorts,
            );
          }

          if (
            coreView.shouldHideEmptyGroups !==
            existingView.shouldHideEmptyGroups
          ) {
            const view = convertCoreViewToView(coreView);
            set(
              recordIndexShouldHideEmptyRecordGroupsComponentState.atomFamily({
                instanceId: getRecordIndexIdFromObjectNamePluralAndViewId(
                  objectMetadataItem.namePlural,
                  view.id,
                ),
              }),
              view.shouldHideEmptyGroups,
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
