import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { isWidgetViewType } from 'twenty-shared/utils';

export const computeObjectViewTargetIds = <
  TView extends Pick<
    View,
    'id' | 'objectMetadataId' | 'key' | 'type' | 'position'
  >,
>({
  views,
  objectMetadataId,
}: {
  views: TView[];
  objectMetadataId?: string;
}): {
  firstSelectableViewId?: string;
  indexViewId?: string;
} => {
  const selectableViewsOnObject = views
    .filter(
      (view) =>
        view.objectMetadataId === objectMetadataId &&
        !isWidgetViewType(view.type),
    )
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));

  return {
    firstSelectableViewId: selectableViewsOnObject.find(
      (view) => view.key !== ViewKey.INDEX,
    )?.id,
    indexViewId: selectableViewsOnObject.find(
      (view) => view.key === ViewKey.INDEX,
    )?.id,
  };
};
