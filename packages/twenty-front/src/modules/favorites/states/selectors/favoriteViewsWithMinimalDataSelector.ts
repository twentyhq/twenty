import { coreViewsState } from '@/views/states/coreViewState';
import { type View } from '@/views/types/View';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { selector } from 'recoil';

export const favoriteViewsWithMinimalDataSelector = selector<
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
