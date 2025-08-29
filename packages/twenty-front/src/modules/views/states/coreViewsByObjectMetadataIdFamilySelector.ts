import { selectorFamily } from 'recoil';

import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';

export const coreViewsByObjectMetadataIdFamilySelector = selectorFamily<
  CoreViewWithRelations[],
  string
>({
  key: 'coreViewsByObjectMetadataIdFamilySelector',
  get:
    (objectMetadataId: string) =>
    ({ get }) => {
      const coreViews = get(coreViewsState);

      return coreViews.filter(
        (view) => view.objectMetadataId === objectMetadataId,
      );
    },
  set:
    (objectMetadataId: string) =>
    ({ get, set }, newViewsForObject) => {
      const currentCoreViews = get(coreViewsState);

      const viewsFromOtherObjects = currentCoreViews.filter(
        (view) => view.objectMetadataId !== objectMetadataId,
      );

      let updatedViewsForObject: CoreViewWithRelations[];

      if (Array.isArray(newViewsForObject)) {
        updatedViewsForObject = newViewsForObject;
      } else {
        updatedViewsForObject = [];
      }

      const newCoreViews = [...viewsFromOtherObjects, ...updatedViewsForObject];

      set(coreViewsState, newCoreViews);
    },
});
