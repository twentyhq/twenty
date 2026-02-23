import { coreViewsState } from '@/views/states/coreViewState';
import { type View } from '@/views/types/View';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';

export const favoriteViewsWithMinimalDataSelector = createSelectorV2<
  Pick<View, 'id' | 'name' | 'objectMetadataId' | 'icon'>[]
>({
  key: 'favoriteViewsWithMinimalDataSelector',
  get: ({ get }) => {
    const coreViews = get(coreViewsState);
    const views = coreViews.map(convertCoreViewToView);
    return views.map((view) => ({
      id: view.id,
      name: view.name,
      objectMetadataId: view.objectMetadataId,
      icon: view.icon,
    }));
  },
});
