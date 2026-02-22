import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { createWritableFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createWritableFamilySelectorV2';

export const coreViewsByObjectMetadataIdFamilySelector =
  createWritableFamilySelectorV2<CoreViewWithRelations[], string>({
    key: 'coreViewsByObjectMetadataIdFamilySelector',
    get:
      (objectMetadataId) =>
      ({ get }) => {
        const coreViews = get(coreViewsState);
        return coreViews.filter(
          (view) => view.objectMetadataId === objectMetadataId,
        );
      },
    set:
      (objectMetadataId) =>
      ({ get, set }, newViewsForObject) => {
        const currentCoreViews = get(coreViewsState);
        const viewsFromOtherObjects = currentCoreViews.filter(
          (view) => view.objectMetadataId !== objectMetadataId,
        );
        const newCoreViews = [
          ...viewsFromOtherObjects,
          ...(Array.isArray(newViewsForObject) ? newViewsForObject : []),
        ];
        set(coreViewsState, newCoreViews);
      },
  });
