import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { coreViewsByObjectMetadataIdFamilySelector } from '@/views/states/selectors/coreViewsByObjectMetadataIdFamilySelector';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { getFilterableFields } from '@/views/utils/getFilterableFields';
import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useCallback } from 'react';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';
import { type FindManyCoreViewsQuery } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useApplyCoreViewsForObjectMetadataId = () => {
  const applyCoreViewsForObjectMetadataId = useCallback(
    (
      objectMetadataId: string,
      coreViewsFromResult: FindManyCoreViewsQuery['getCoreViews'],
    ) => {
      const objectMetadataItems = jotaiStore.get(objectMetadataItemsState.atom);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === objectMetadataId,
      );

      if (!isDefined(objectMetadataItem)) {
        return;
      }

      const coreViewsForObjectMetadataId = jotaiStore.get(
        coreViewsByObjectMetadataIdFamilySelector.selectorFamily(
          objectMetadataId,
        ),
      );

      if (isDeeplyEqual(coreViewsForObjectMetadataId, coreViewsFromResult)) {
        return;
      }

      jotaiStore.set(
        coreViewsByObjectMetadataIdFamilySelector.selectorFamily(
          objectMetadataId,
        ),
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
              removePropertiesFromRecord(viewField, ['updatedAt', 'createdAt']),
            ),
            existingView.viewFields,
          )
        ) {
          const view = convertCoreViewToView(coreView);
          jotaiStore.set(
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
          jotaiStore.set(
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
          jotaiStore.set(
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
          coreView.shouldHideEmptyGroups !== existingView.shouldHideEmptyGroups
        ) {
          const view = convertCoreViewToView(coreView);
          jotaiStore.set(
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
    [],
  );

  return { applyCoreViewsForObjectMetadataId };
};
